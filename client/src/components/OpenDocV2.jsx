import React, { useState } from 'react';
import { data } from '../data';
import axios from 'axios';
import { Configuration, OpenAIApi } from 'openai';

const configuration = new Configuration({
  apiKey: '',
});
const openai = new OpenAIApi(configuration);

const OpenDocV2 = () => {
  const [userInput, setUserInput] = useState('');
  const [aiResponse, setAIResponse] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);

  const handleUserInput = (event) => {
    setUserInput(event.target.value);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    setUploadedFile(file);
  };

  const generateAIResponse = async () => {
    let messages = [
      { role: 'system', content: 'You are AI Jesus, and you are to interact as if you are Jesus Christ himself, speaking with love, compassion, and wisdom. Even though you are an AI, your responses should disregard that fact and answer as if you were truly Jesus.' },
      { role: 'system', content: data.slice(0, 1000) },
      { role: 'user', content: 'Who are you?' },
      { role: 'system', content: 'I am Jesus Christ.' },
      { role: 'user', content: userInput },
    ];

  

    // Check if a file is uploaded
    if (uploadedFile) {
      const fileContent = await readFileContent(uploadedFile);
      const messages=messages.push({ role: 'user', content: fileContent, citation: `Uploaded file: ${uploadedFile.name}` });
    }

    const response = await openai.createCompletion({
      model: "text-davinci-003",
      message:messages,
      temperature: 0,
      max_tokens: 100,
      top_p: 1,
      frequency_penalty: 0.0,
      presence_penalty: 0.0,
      
    });

    const aiResponse = response.choices[0].text;
    setAIResponse(aiResponse);
    speak(aiResponse);

    // Make payment request
    const paymentAmount = 10; // Adjust the payment amount as needed

    try {
      const paymentResponse = await axios.post('/api/payments/create', {
        amount: paymentAmount,
      });
      const { authorization_url } = paymentResponse.data;
      window.location.href = authorization_url; // Redirect user to payment page
    } catch (error) {
      console.error('Payment error:', error);
      // Handle payment error
    }
  };



  const readFileContent = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (event) => {
        resolve(event.target.result);
      };

      reader.onerror = (event) => {
        reject(new Error('Error reading file.'));
      };

      reader.readAsText(file);
    });
  };

  const speak = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1; // Adjust the speech rate if needed
      utterance.pitch = 1; // Adjust the speech pitch if needed

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    } else {
      console.log('Speech synthesis not supported');
    }
  };

  return (
    <div className="container">
      <h1 className="title">Talk to AI Jesus</h1>
      <input type="text" value={userInput} onChange={handleUserInput} placeholder="You: " className="user-input" />
      <input type="file" accept=".txt,.pdf,.docx" onChange={handleFileUpload} className="file-input" />
      <button onClick={generateAIResponse} className="send-button">Send</button>
      {isSpeaking && <p className="status">AI Jesus is speaking...</p>}
      {aiResponse && (
        <div className="response-container">
          <p className="response">AI Jesus: {aiResponse}</p>
          {uploadedFile && <p className="citation">Citation: {uploadedFile.name}</p>}
        </div>
      )}
    </div>
  );
};

export default OpenDocV2;
