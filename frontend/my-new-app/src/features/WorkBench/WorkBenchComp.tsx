import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import axios from 'axios';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';

interface WorkBenchCompProps {
  initialCode: string;
}

interface CodeBlock {
  title: string;
  initialTemplate: string;
}

const WorkBenchComp: React.FC<WorkBenchCompProps> = ({ initialCode }) => {
  const { id } = useParams();
  const [codeBlock, setCodeBlock] = useState<CodeBlock | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [code, setCode] = useState<string>(initialCode);
  const [terminalMessage, setTerminalMessage] = useState<string | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [role, setrole] = useState<string>('')

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
          err instanceof Error ? `Error: ${err.message}` : "An unknown error occurred."
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchCodeBlock();

    const newSocket = io('http://localhost:8080');
    setSocket(newSocket);

    newSocket.emit('joinRoom', id);

    newSocket.on('receiveCode', (updatedCode: string) => {
      if (updatedCode !== code) {
        setCode(updatedCode); // Update the editor only if the received code is different
      }
    });

    return () => {
      newSocket.disconnect();
    };
  }, [id]);

  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
    socket?.emit('editCode', { roomId: id, updatedCode: newCode }); // Emit the code update event
  };

  useEffect(() => {
    if (socket) {
      socket.on('codeUpdate', (updatedCode: string) => {
        // console.log('Received code update:', updatedCode); // Debugging log
        if (updatedCode !== code) {
          setCode(updatedCode);  // Update code in the editor if different
        }
      });
    }
  }, [socket, code]);

  useEffect(() => {
    if (socket) {
      socket.on('newUser', (data) => {
        console.log(`New user joined as: ${data.userRole}`);
        setrole(data.userRole);
        // You can update the UI to reflect the user's role (mentor/student)
      });
    }
  }, [socket]);

  const runCode = async () => {
    try {
      setTerminalMessage(null);
      const response = await axios.post(
        `http://localhost:8080/api/codeblocks/submit`,
        {
          title: codeBlock?.title,
          userSolution: code,
        }
      );

      setTerminalMessage(response.data.message);
    } catch (err: unknown) {
      setTerminalMessage(
        err instanceof Error ? `Error: ${err.message}` : "An unknown error occurred."
      );
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="interactive-code-block">
      <h1 className="text-2xl font-bold mb-4">{codeBlock?.title || "Untitled Code Block"}</h1>
      <div>{role}</div>
      <div className="editor-container bg-gray-800 p-4 rounded mb-4">
        <CodeMirror
          value={code}
          height="200px"
          theme="dark"
          extensions={[javascript()]}
          readOnly={role === 'Mentor'}
          onChange={(value) => handleCodeChange(value)} 
        />
      </div>
      <button
        onClick={runCode}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Run Code
      </button>
      <div className="terminal-output bg-black text-white p-4 mt-4 rounded">
        <h2 className="text-lg font-bold">Output:</h2>
        {terminalMessage ? (
          <pre className={terminalMessage.startsWith("Error") ? "text-red-500" : "text-green-500"}>
            {terminalMessage}
          </pre>
        ) : (
          <pre>No output yet. Run the code to see results.</pre>
        )}
      </div>
    </div>
  );
};

export default WorkBenchComp;
