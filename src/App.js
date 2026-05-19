
import React, { useState } from 'react';
import './App.css';

const App = () => {
  const [selectedMood, setSelectedMood] = useState(null);
  const [comment, setComment] = useState('');
  const [biscoito, setBiscoito] = useState('');
  const [selectedEditor, setSelectedEditor] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const editors = [
    
    { id: 1, name: 'Angie', role: 'Editora II', avatar: 'Ag', color: '#FD79A8', gradient: 'linear-gradient(135deg, #FD79A8, #FF9FF3)' },
    { id: 2, name: 'Cintya', role: 'Supervisora de Conteúdo', avatar: 'Cy', color: '#00B894', gradient: 'linear-gradient(135deg, #00B894, #55EFC4)' },
    { id: 3, name: 'Erick', role: 'Editor I', avatar: 'Ek', color: '#2D3436', gradient: 'linear-gradient(135deg, #2D3436, #636E72)' },
    { id: 4, name: 'Hemilly', role: 'Editora I', avatar: 'Hy', color: '#E17055', gradient: 'linear-gradient(135deg, #E17055, #FDCB6E)' },
    { id: 5, name: 'Iza', role: 'Editora III', avatar: 'Iz', color: '#0984E3', gradient: 'linear-gradient(135deg, #0984E3, #74B9FF)' },
    { id: 6, name: 'Larissa', role: 'Editora I', avatar: 'La', color: '#D63031', gradient: 'linear-gradient(135deg, #D63031, #FF7675)' },
    { id: 7, name: 'Lídya', role: 'Editora III', avatar: 'Ly', color: '#c98be6', gradient: 'linear-gradient(135deg, #c98be6, #9305af)' },
    { id: 8, name: 'Lívia', role: 'Editora III', avatar: 'Lv', color: '#FDCB6E', gradient: 'linear-gradient(135deg, #FDCB6E, #ece0b7)' },
    { id: 9, name: 'Luana', role: 'Editora I', avatar: 'Ln', color: '#7feaf1', gradient: 'linear-gradient(135deg, #7feaf1, #364aa3)' },
    { id: 10, name: 'Nayre', role: 'Editora III', avatar: 'Ny', color: '#8bf3ba', gradient: 'linear-gradient(135deg, #8bf3ba, #6bf77d)' },
    { id: 11, name: 'Vevé', role: 'Gerente de conteúdo', avatar: 'Vv', color: '#6C5CE7', gradient: 'linear-gradient(135deg, #6C5CE7, #A29BFE)' },
    { id: 12, name: 'Anônimo', role: 'Gostaria de não me identificar', avatar: '🔐', color: '#939394', gradient: 'linear-gradient(135deg, #616161, #ffffff)' }

  ];

  const moods = [
    { emoji: '😞', label: 'Frustante', color: '#00B894', bg: '#E6FFF8' },
    { emoji: '🤯', label: 'Agitada', color: '#74B9FF', bg: '#E6F3FF' },
    { emoji: '🙃', label: 'OK', color: '#636E72', bg: '#F5F6FA' },
    { emoji: '😉', label: 'Boa', color: '#FDCB6E', bg: '#FFF9E6' },
    { emoji: '🤩', label: 'Incrível', color: '#E17055', bg: '#FFF0ED' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedEditor) {
      alert('Por favor, selecione seu nome para continuar.');
      return;
    }

    if (!selectedMood) {
      alert('Por favor, selecione como foi sua semana.');
      return;
    }

    setIsSubmitting(true);

    const formData = {
      timestamp: new Date().toISOString(),
      editorName: selectedEditor.name,
      mood: selectedMood.emoji,
      moodLabel: selectedMood.label,
      comment: comment || 'Não informado',
      biscoito: biscoito || 'Não informado'
    };

    try {
      await sendToGoogleSheets(formData);
      setIsSubmitted(true);
      
      setTimeout(() => {
        setSelectedMood(null);
        setComment('');
        setBiscoito('');
        setSelectedEditor(null);
        setIsSubmitted(false);
        setCurrentStep(1);
      }, 3000);
      
    } catch (error) {
      console.error('Erro ao enviar:', error);
      alert('Houve um erro ao enviar sua resposta. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const sendToGoogleSheets = async (data) => {
  const GOOGLE_SCRIPT_URL = process.env.REACT_APP_GOOGLE_SCRIPT_URL;
  
  
  const urlEncodedData = new URLSearchParams();
  urlEncodedData.append('timestamp', data.timestamp);
  urlEncodedData.append('editorName', data.editorName);
  urlEncodedData.append('mood', data.mood);
  urlEncodedData.append('moodLabel', data.moodLabel);
  urlEncodedData.append('comment', data.comment);
  urlEncodedData.append('biscoito', data.biscoito);
  
  try {
    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: urlEncodedData.toString()
    });
    
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    console.log('Resposta do servidor:', result);
    return result;
    
  } catch (error) {
    
    if (error.message === 'A listener indicated an asynchronous response by returning true, but the message channel closed before a response was received') {
      console.warn('Erro de extensão do navegador ignorado');
      
      return await fallbackSendToGoogleSheets(data);
    }
    
    console.error('Erro ao enviar para Google Sheets:', error);
    throw error;
  }
};


const fallbackSendToGoogleSheets = async (data) => {
  const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzCw_1iTvzhEm4AkCEgUpMzznVPme32SgQMx2Bczt3AefXDqU0yQJ0KECv-8mJpB8P3/exec';
  
  try {
    
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', GOOGLE_SCRIPT_URL, true);
      xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
      
      xhr.onload = function() {
        if (xhr.status === 200) {
          resolve(JSON.parse(xhr.responseText));
        } else {
          reject(new Error(`HTTP error! status: ${xhr.status}`));
        }
      };
      
      xhr.onerror = function() {
        reject(new Error('Network error'));
      };
      
      const urlEncodedData = new URLSearchParams();
      urlEncodedData.append('timestamp', data.timestamp);
      urlEncodedData.append('editorName', data.editorName);
      urlEncodedData.append('mood', data.mood);
      urlEncodedData.append('moodLabel', data.moodLabel);
      urlEncodedData.append('comment', data.comment);
      urlEncodedData.append('biscoito', data.biscoito);
      
      xhr.send(urlEncodedData.toString());
    });
  } catch (error) {
    console.error('Erro no método alternativo:', error);
    throw error;
  }
};

  if (isSubmitted) {
    return (
      <div className="app">
        <div className="container success-container">
          <div className="success-animation">
            <div className="success-circle">
              <span className="success-icon">✓</span>
            </div>
          </div>
          <h2 className="success-title">Obrigado pelo feedback! ❤️</h2>
          <p className="success-message">Sua resposta foi registrada com sucesso.</p>
          <div className="success-details">
            <span>{selectedEditor?.name}: {selectedEditor?.role}</span>
            <span className="success-mood">{selectedMood?.emoji}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <div className="container">
        {/* Header Premium */}
        <header className="header">
          <div className="header-badge">FEEDBACK SEMANAL</div>
          <h1>Pulso do Fund</h1>
          <p className="header-subtitle">
            Esse é um espaço de escuta pensado especialmente pro nosso time de edição. Compartilha com a gente suas percepções?
          </p>
          <div className="header-divider">
            <span className="divider-icon">❤️</span>
          </div>
        </header>

        {/* Indicador de Progresso */}
        <div className="progress-bar">
          <div className={`progress-step ${currentStep >= 1 ? 'active' : ''}`}>
            <div className="step-number">1</div>
            <span className="step-label">Identificação</span>
          </div>
          <div className={`progress-line ${currentStep >= 2 ? 'active' : ''}`}></div>
          <div className={`progress-step ${currentStep >= 2 ? 'active' : ''}`}>
            <div className="step-number">2</div>
            <span className="step-label">Humor</span>
          </div>
          <div className={`progress-line ${currentStep >= 3 ? 'active' : ''}`}></div>
          <div className={`progress-step ${currentStep >= 3 ? 'active' : ''}`}>
            <div className="step-number">3</div>
            <span className="step-label">Feedback</span>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Seção 1: Identificação */}
          <section className={`section ${currentStep === 1 ? 'section-active' : ''}`}>
            <div className="section-header">
              <span className="section-icon">👤</span>
              <h2>Quem é você?</h2>
            </div>
            <p className="section-description">Selecione seu perfil para continuar, ou selecione "Anônimo" caso prefira não se identificar.</p>
            
            <div className="avatar-grid">
              {editors.map((editor) => (
                <div
                  key={editor.id}
                  className={`avatar-card ${selectedEditor?.id === editor.id ? 'selected' : ''}`}
                  onClick={() => {
                    setSelectedEditor(editor);
                    setCurrentStep(2);
                  }}
                  style={{ '--avatar-gradient': editor.gradient }}
                >
                  <div className="avatar-circle" style={{ background: editor.gradient }}>
                    {editor.avatar}
                  </div>
                  <div className="avatar-info">
                    <span className="avatar-name">{editor.name}</span>
                    <span className="avatar-role">{editor.role}</span>
                  </div>
                  {selectedEditor?.id === editor.id && (
                    <div className="avatar-check">✓</div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Seção 2: Humor */}
          <section className={`section ${currentStep === 2 ? 'section-active' : ''}`}>
            <div className="section-header">
              <span className="section-icon">😊</span>
              <h2>E aí, conta pra gente: como foi sua semana?</h2>
            </div>
            <p className="section-description">Escolha o emoji que melhor resume sua semana</p>
            
            <div className="mood-grid">
              {moods.map((mood) => (
                <button
                  key={mood.emoji}
                  type="button"
                  className={`mood-card ${selectedMood?.emoji === mood.emoji ? 'selected' : ''}`}
                  onClick={() => {
                    setSelectedMood(mood);
                    setCurrentStep(3);
                  }}
                  style={{
                    '--mood-color': mood.color,
                    '--mood-bg': mood.bg
                  }}
                >
                  <span className="mood-emoji">{mood.emoji}</span>
                  <span className="mood-label">{mood.label}</span>
                  {selectedMood?.emoji === mood.emoji && (
                    <div className="mood-indicator" style={{ background: mood.color }}></div>
                  )}
                </button>
              ))}
            </div>
          </section>

          {/* Seção 3: Feedback */}
          <section className={`section ${currentStep === 3 ? 'section-active' : ''}`}>
            <div className="section-header">
              <span className="section-icon">💬</span>
              <h2>Compartilhe mais detalhes</h2>
            </div>
            
            <div className="input-group">
              <label className="input-label">
                <span className="label-icon">📝</span>
                Quer contar o motivo? (Opcional)
              </label>
              <textarea
                className="comment-input"
                placeholder="Compartilhe o que está acontecendo... Suas palavras são importantes para nós."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
              />
              <span className="input-counter">{comment.length}/500</span>
            </div>

            <div className="input-group biscoito-group">
              <label className="input-label">
                <span className="label-icon">🍪</span>
                Hora do Biscoito
              </label>
              <p className="biscoito-description">
                Reconheça alguém que fez a diferença na sua semana ou celebre uma conquista do time!
              </p>
              <textarea
                className="comment-input biscoito-input"
                placeholder="Ex: A Gê me ajudou muito com as intervenções do capítulo X... O time arrasou na entrega do projeto Y..."
                value={biscoito}
                onChange={(e) => setBiscoito(e.target.value)}
                rows={3}
              />
              <span className="input-counter">{biscoito.length}/300</span>
            </div>
          </section>

          {/* Botão de Envio */}
          <button 
            type="submit" 
            className="submit-button"
            disabled={isSubmitting || !selectedEditor || !selectedMood}
          >
            {isSubmitting ? (
              <span className="button-loading">
                <span className="loading-dot"></span>
                <span className="loading-dot"></span>
                <span className="loading-dot"></span>
              </span>
            ) : (
              <>
                <span>Enviar Feedback</span>
                <span className="button-icon">→</span>
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <footer className="footer">
          <p>💡 Suas respostas são confidenciais e nos ajudam a melhorar</p>
        </footer>
      </div>
    </div>
  );
};

export default App;