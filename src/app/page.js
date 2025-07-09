'use client';

import { useState, useRef, useEffect } from 'react';
import styles from './page.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBrain,
  faFemale,
  faVenus,
  faVial,
  faLungs,
  faVirus,
  faTooth,
} from '@fortawesome/free-solid-svg-icons';

export default function HomePage() {
  const [currentFile, setCurrentFile] = useState(null);
  const [previewSrc, setPreviewSrc] = useState('');
  const [prediction, setPrediction] = useState('');
  const [cancerType, setCancerType] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [showModal, setShowModal] = useState(true);
  const fileInputRef = useRef(null);

  const translations = {
    en: {
      selectCancerType: 'Select Cancer Type',
      selectCancerTypeDesc: 'Please select the type of cancer you want to analyze:',
      brain: 'Brain',
      breast: 'Breast',
      cervical: 'Cervical',
      kidney: 'Kidney',
      lungandcolon: 'Lung and Colon',
      lymph: 'Lymph',
      oral: 'Oral',
      uploadFile: 'Upload File',
      deleteFile: 'Delete File',
      predict: 'Predict',
      imagePreview: 'Image Preview',
      predictionPlaceholder: 'Prediction result will be displayed here...',
      selectModel: 'Select Model:',
      language: 'Language:',
    },
    tr: {
      selectCancerType: 'Kanser Türü Seçin',
      selectCancerTypeDesc: 'Lütfen analiz etmek istediğiniz kanser türünü seçin:',
      brain: 'Beyin',
      breast: 'Meme',
      cervical: 'Servikal',
      kidney: 'Böbrek',
      lungandcolon: 'Akciğer ve Kolon',
      lymph: 'Lenf',
      oral: 'Ağız',
      uploadFile: 'Dosya Yükle',
      deleteFile: 'Dosyayı Sil',
      predict: 'Tahmin Et',
      imagePreview: 'Görsel Önizleme',
      predictionPlaceholder: 'Tahmin sonucu burada görüntülenecek...',
      selectModel: 'Model Seç:',
      language: 'Dil:',
    },
  };

  const t = translations[selectedLanguage];

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const formData = new FormData();
      formData.append('file', file);
  
      try {
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
  
        const data = await response.json();
        console.log("✅ Upload response:", data);
  
        if (data.success) {
          setCurrentFile(data.filename);
          setPreviewSrc(`/uploads/${data.filename}`);
  
          // DOM erişimini güvenli hale getir
          setTimeout(() => {
            const img = document.getElementById('previewImage');
            if (img && img.style) img.style.display = 'block';
  
            const placeholder = document.querySelector('.placeholder-text');
            if (placeholder && placeholder.style) placeholder.style.display = 'none';
          }, 100);
        }
      } catch (error) {
        console.error('Upload error:', error);
      }
    }
  };
  
  

  const handleDelete = async () => {
    if (!currentFile) return;

    try {
      const response = await fetch('/api/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: currentFile }),
      });

      const data = await response.json();

      if (data.success) {
        setCurrentFile(null);
        setPreviewSrc('');
        setPrediction('');
        document.getElementById('previewImage').style.display = 'none';
        document.querySelector('.placeholder-text').style.display = 'block';
      }
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const handlePredict = async () => {
    if (!currentFile || !cancerType) return;
  
    try {
      const formData = new FormData();
      const selectedModel = document.getElementById('modelSelect').value;
      const file = fileInputRef.current.files?.[0];
      if (!file) return;
  
      formData.append('model_arch', selectedModel);
      formData.append('image', file);
  
      const response = await fetch(`/api/predict/${cancerType}/`, {
        method: 'POST',
        headers: {
          'Accept-Language': selectedLanguage,
        },
        body: formData,
      });
  
      const rawText = await response.text();
  
      let data;
      try {
        data = JSON.parse(rawText);
      } catch (err) {
        setPrediction(`❌ ${selectedLanguage === 'tr' ? 'Sunucu hatası' : 'Server error'}:\n${rawText}`);
        return;
      }
  
      if (data.result_label) {
        const formattedLabel = data.result_label
          .replace(/_/g, ' ')
          .replace(/\b\w/g, (l) => l.toUpperCase());
        const formattedConfidence = (data.result_confidence * 100).toFixed(2) + '%';
  
        const result =
          `✔️ ${selectedLanguage === 'tr' ? 'Tahmin tamamlandı' : 'Prediction completed'}:\n` +
          `🧠 ${selectedLanguage === 'tr' ? 'Kanser Türü' : 'Cancer Type'}: ${formattedLabel}\n` +
          `🎯 ${selectedLanguage === 'tr' ? 'Doğruluk' : 'Confidence'}: ${formattedConfidence}\n` +
          `📊 ${selectedLanguage === 'tr' ? 'İndeks' : 'Index'}: ${data.result_index}`;
  
        setPrediction(result);
      } else {
        // Geriye prediction: "...", label, confidence, index gibi farklı yapılar dönüyorsa
        const labelText = data.label ? `\n🧠 Label: ${data.label}` : '';
        const confidenceText = data.confidence ? `\n🎯 Confidence: ${data.confidence}` : '';
        const indexText = data.index !== undefined ? `\n📊 Index: ${data.index}` : '';
  
        setPrediction((data.prediction || '✔️ Prediction completed.') + labelText + confidenceText + indexText);
      }
    } catch (error) {
      console.error('Predict error:', error);
      setPrediction(`❌ ${selectedLanguage === 'tr' ? 'Beklenmeyen hata oluştu' : 'Unexpected error occurred'}:\n${error.message}`);
    }
  };
  
  
  
  

  useEffect(() => {
    const storedLang = localStorage.getItem('selectedLanguage');
    const storedType = localStorage.getItem('selectedCancerType');
    if (storedLang) setSelectedLanguage(storedLang);
    if (storedType) setCancerType(storedType);
  }, []);

  const handleLanguageChange = (e) => {
    const lang = e.target.value;
    setSelectedLanguage(lang);
    localStorage.setItem('selectedLanguage', lang);
  };

  const handleCancerTypeSelect = (type) => {
    setCancerType(type);
    localStorage.setItem('selectedCancerType', type);
    setShowModal(false);
  };

  return (
    <div className={styles.container}>
      <div className={styles.topBar}>
        <div className={styles.modelSelectSection}>
          <label htmlFor="modelSelect">
            <b>{t.selectModel}</b>
          </label>
          <select id="modelSelect" className={styles.modelSelect}>
            <option value="mobilenet">MobileNet</option>
            <option value="efficientnet">EfficientNet</option>
          </select>
        </div>
        <div className={styles.languageSelectSection}>
          <label htmlFor="languageSelect">
            <b>{t.language}</b>
          </label>
          <select
            id="languageSelect"
            className={styles.languageSelect}
            onChange={handleLanguageChange}
            value={selectedLanguage}
          >
            <option value="en">English</option>
            <option value="tr">Türkçe</option>
          </select>
        </div>
      </div>

      {showModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h2 className={styles.modalTitle}>{t.selectCancerType}</h2>
            <p className={styles.modalDescription}>{t.selectCancerTypeDesc}</p>
            <div className={styles.cancerOptions}>
              <button
                onClick={() => handleCancerTypeSelect('brain')}
                className={styles.cancerTypeBtn}
              >
                <FontAwesomeIcon icon={faBrain} style={{ height: '20px', width: '30px' }} />{' '}
                {t.brain}
              </button>
              <button
                onClick={() => handleCancerTypeSelect('breast')}
                className={styles.cancerTypeBtn}
              >
                <FontAwesomeIcon icon={faFemale} style={{ height: '30px', width: '30px' }} />{' '}
                {t.breast}
              </button>
              <button
                onClick={() => handleCancerTypeSelect('cervical')}
                className={styles.cancerTypeBtn}
              >
                <FontAwesomeIcon icon={faVenus} style={{ height: '30px', width: '30px' }} />{' '}
                {t.cervical}
              </button>
              <button
                onClick={() => handleCancerTypeSelect('kidney')}
                className={styles.cancerTypeBtn}
              >
                <FontAwesomeIcon icon={faVial} style={{ height: '30px', width: '30px' }} />{' '}
                {t.kidney}
              </button>
              <button
                onClick={() => handleCancerTypeSelect('lungandcolon')}
                className={styles.cancerTypeBtn}
              >
                <FontAwesomeIcon icon={faLungs} style={{ height: '30px', width: '30px' }} />{' '}
                {t.lungandcolon}
              </button>

              <button
  onClick={() => handleCancerTypeSelect('lymphoma')}
  className={styles.cancerTypeBtn}
>
  <FontAwesomeIcon icon={faVirus} style={{ height: '30px', width: '30px' }} /> {t.lymph}
</button>

              <button
                onClick={() => handleCancerTypeSelect('oral')}
                className={styles.cancerTypeBtn}
              >
                <FontAwesomeIcon icon={faTooth} style={{ height: '30px', width: '30px' }} />{' '}
                {t.oral}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className={styles.uploadSection}>
        <input
          type="file"
          accept=".png,.jpg,.jpeg"
          ref={fileInputRef}
          onChange={handleFileUpload}
          style={{ display: 'none' }}
        />
        <button className={styles.btn} onClick={() => fileInputRef.current.click()}>
          {t.uploadFile}
        </button>
        <button
          className={styles.btn}
          onClick={handleDelete}
          disabled={!currentFile}
        >
          {t.deleteFile}
        </button>
        <button
          className={styles.btn}
          onClick={handlePredict}
          disabled={!currentFile}
        >
          {t.predict}
        </button>
      </div>

      <div className={styles.previewSection}>
        <div className={styles.imagePreview}>
          {previewSrc ? (
            <img src={previewSrc} alt="preview" id="previewImage" />
          ) : (
            <p className={`${styles.placeholderText} placeholder-text`}>
              {t.imagePreview}
            </p>
          )}
        </div>
      </div>

      <div className={styles.resultSection}>
        <textarea
          id="predictionResult"
          value={prediction}
          placeholder={t.predictionPlaceholder}
          readOnly
        />
      </div>
    </div>
  );
}