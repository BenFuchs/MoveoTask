import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { io, Socket } from "socket.io-client";
import axios from "axios";
import CodeMirror, { EditorView } from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import styles from '../../stylesheets/General.module.css'


interface WorkBenchCompProps {
  initialCode: string;
}

interface CodeBlock {
  title: string;
  initialTemplate: string;
}

const WorkBenchComp: React.FC<WorkBenchCompProps> = ({ initialCode }) => {
  const { id } = useParams();
  const Navigate = useNavigate();
  const [codeBlock, setCodeBlock] = useState<CodeBlock | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [code, setCode] = useState<string>(initialCode);
  const [terminalMessage, setTerminalMessage] = useState<string | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [role, setRole] = useState<string>("");
  const [isSuccess, setIsSuccess] = useState<boolean>(false); 


  useEffect(() => {
    if (!id) {
      setTerminalMessage("Error: No code block ID found.");
      setIsLoading(false);
      return;
    }

    const fetchCodeBlock = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8080/api/codeblocks/${encodeURIComponent(id)}`
        );
        setCodeBlock(response.data);
        setCode(response.data.initialTemplate);
      } catch (err: unknown) {
        setTerminalMessage(
          err instanceof Error
            ? `Error: ${err.message}`
            : "An unknown error occurred."
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchCodeBlock();

    const newSocket = io("http://localhost:8080");
    setSocket(newSocket);

    newSocket.emit("joinRoom", id);

    newSocket.on("receiveCode", (updatedCode: string) => {
      if (updatedCode !== code) {
        setCode(updatedCode); 
      }
    });

    return () => {
      newSocket.disconnect();
    };
  }, [id]);

  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
    socket?.emit("editCode", { roomId: id, updatedCode: newCode });
  };

  useEffect(() => {
    if (socket) {
      socket.on("mentorLeft", () => {
        Navigate("/");
        console.log("Mentor left! Logging out all students.");
      });
    }
  }, [socket, Navigate]);

  useEffect(() => {
    if (socket) {
      socket.on("codeUpdate", (updatedCode: string) => {
        if (updatedCode !== code) {
          setCode(updatedCode);
        }
      });
    }
  }, [socket, code]);

  useEffect(() => {
    if (socket) {
      socket.on("newUser", (data) => {
        console.log(`New user joined as: ${data.userRole}`);
        setRole(data.userRole);
      });
    }
  }, [socket]);

  const runCode = async () => {
    try {
      setTerminalMessage(null);
      setIsSuccess(false); 
      const response = await axios.post(
        `http://localhost:8080/api/codeblocks/submit`,
        {
          title: codeBlock?.title,
          userSolution: code,
        }
      );

      if (response.data.message === "Solution is correct! :)") {
        setIsSuccess(true); // Set success state
      }

      setTerminalMessage(response.data.message);
    } catch (err: unknown) {
      setTerminalMessage(
        err instanceof Error
          ? `Error: ${err.message}`
          : "An unknown error occurred."
      );
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div >
    {isSuccess ? (
      <div >
        <h1  className={styles.divCentering}>🎉 🎉 🎉</h1>
        <h2>Great job! You got it right! 😊</h2>
        <div className={styles.divCentering}>
        <Link
              to={`/`}
              className={styles.linkButton}
            >
              Back to lobby
            </Link>
            </div>
      </div>
    ) : (
      <>
        <h1 className={styles.title}>
          {codeBlock?.title || "Untitled Code Block"}
        </h1>
        <div className={styles.divCentering}>User is: {role}</div>
        <div className={styles.editorContainer}>
          <CodeMirror
            value={code}
            height="200px"
            theme="dark"
            extensions={[javascript(), EditorView.lineWrapping]}
            onChange={(value) => handleCodeChange(value)}
            style={{ minWidth: "100%" }}
            readOnly={role === 'Mentor'}
          />
        </div>
        <div className={styles.divCentering}>
          <button onClick={runCode} className={styles.linkButton}>
            Run Code
          </button>
        </div>
        <div className={styles.terminalOutput}>
          <h2 className={styles.divCentering}>Output:</h2>
          {terminalMessage ? (
            <pre className={styles.divCentering}>{terminalMessage}</pre>
          ) : (
            <pre className={styles.divCentering}>
              No output yet. Run the code to see results.
            </pre>
          )}
        </div>
      </>
    )}
  </div>
  );
};

export default WorkBenchComp;
