import React, { useState } from 'react';
import {
    modelElen
  } from "../../src/assets/images";
const SendToWhatsAppForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const sendToWhatsApp = () => {
    const number = '+2348160064844'; // Replace with the actual phone number
    const { name, email, message } = formData;

    const url = `https://wa.me/${number}?text=` +
      `Name: ${name}%0a` +
      `Email: ${email}%0a` +
      `Message: ${message}%0a%0a`;

    window.open(url, '_blank').focus();
  };

  return (
    <div className='md:grid-cols-2 grid-cols-1 my-6 grid'>
    <div className="p-4  py-12 my-12 max-w-md mx-auto bg-white shadow-md rounded">
       
      
     <h2 className="text-xl font-semibold mb-4">Send to WhatsApp</h2>
      <input
        type="text"
        name="name"
        placeholder="Name"
        value={formData.name}
        onChange={handleChange}
        className="w-full p-2 mb-3 border border-gray-300 rounded"
      />
      <input
        type="email"
        name="email"
        placeholder="Email"
        value={formData.email}
        onChange={handleChange}
        className="w-full p-2 mb-3 border border-gray-300 rounded"
      />
      <textarea
        name="message"
        placeholder="Message"
        value={formData.message}
        onChange={handleChange}
        className="w-full p-2 mb-3 border border-gray-300 rounded"
      />
      <button
        onClick={sendToWhatsApp}
        className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600 transition"
      >
        Send via WhatsApp
      </button>
    


      </div>

    
      
      <div>
            <img src={modelElen} className='w-96'/>
        </div>


    </div>

  );
};

export default SendToWhatsAppForm;
