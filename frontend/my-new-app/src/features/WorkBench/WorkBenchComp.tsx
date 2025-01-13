import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';

// Update the prop type to accept initialCode
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
  const [Loading, setLoading] = useState<boolean>(true);
  const [code, setCode] = useState(initialCode); // State for code editor
  const [output, setOutput] = useState<string | null>(null); // State for terminal output
  const [error, setError] = useState<string | null>(null); // State for terminal errors

  useEffect(() => {
    if (!id) {
      setError("No ID found.");
      setLoading(false);
      return;
    }

    const fetchCodeBlock = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8080/api/codeblocks/${encodeURIComponent(id)}`
        );
        setCodeBlock(response.data);
        setCode(response.data.initialTemplate); // Set initial code in the editor
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unknown error occurred.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCodeBlock();
  }, [id]);


  const runCode = async () => {
    // console.log(code) //debugging
    try {
      setError('');
      const response = await axios.post(
        `http://localhost:8080/api/codeblocks/submit`,
        {
          title: codeBlock?.title, 
          userSolution: code,
        }
      );
      if (response.data.message === 'Solution is correct!') {
        setOutput('Solution is correct!');
      } else {
        setOutput(response.data.message); // Display custom incorrect answer message
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || 'An unknown error occurred.');
        setOutput(null);
      }
    }
  };

  if (Loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }
  // console.log(codeBlock) 
  return (
    <div className="interactive-code-block">
      <h1 className="text-2xl font-bold mb-4">{codeBlock?.title}</h1>
      <div className="editor-container bg-gray-800 p-4 rounded mb-4">
        <CodeMirror
          value={code}
          height="200px"
          theme="dark"
          extensions={[javascript()]}
          onChange={(value) => setCode(value)} 
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
        {error ? (
          <pre className="text-red-500">{error}</pre>
        ) : (
          <pre>{output}</pre>
        )}
      </div>
    </div>
  );
};

export default WorkBenchComp;
