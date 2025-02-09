'use client';

import { useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const ContactForm = () => {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    try {
      await addDoc(collection(db, 'feedback'), {
        ...formData,
        createdAt: serverTimestamp()
      });
      
      setStatus('success');
      setFormData({ name: '', email: '', message: '' });
      
      setTimeout(() => setStatus('idle'), 3000);
    } catch (error) {
      console.error('Error al enviar feedback:', error);
      setStatus('error');
    }
  };

  return (
    <section className="relative py-16 md:py-20 lg:py-28 bg-gradient-to-b from-white/[0.03] to-transparent dark:from-white/[0.02]" id="contact">
      <div className="container">
        <div className="max-w-2xl mx-auto text-center mb-12">
          <h2 className="text-2xl font-bold !leading-tight text-white sm:text-5xl md:text-[40px]">
            ¿Tienes alguna sugerencia?
          </h2>
          <p className="text-lg !leading-relaxed text-slate-400 mt-4">
            Nos encantaría escuchar tu opinión para mejorar la aplicación
          </p>
        </div>

        <div className="max-w-xl mx-auto">
          <form 
            onSubmit={handleSubmit} 
            className="backdrop-blur-sm bg-white/10 dark:bg-[#0B0F28]/90 p-8 rounded-2xl border border-white/[0.08] shadow-2xl shadow-slate-900/10"
          >
            <div className="mb-6">
              <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-2">
                Nombre
              </label>
              <input
                id="name"
                type="text"
                placeholder="Tu nombre"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-400 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition"
                required
              />
            </div>
            
            <div className="mb-6">
              <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="Tu email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-400 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition"
                required
              />
            </div>

            <div className="mb-6">
              <label htmlFor="message" className="block text-sm font-medium text-slate-300 mb-2">
                Mensaje
              </label>
              <textarea
                id="message"
                placeholder="Tu mensaje"
                value={formData.message}
                onChange={(e) => setFormData({...formData, message: e.target.value})}
                rows={4}
                className="w-full px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-400 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition resize-none"
                required
              />
            </div>

            <button
              type="submit"
              disabled={status === 'loading'}
              className="flex items-center justify-center w-full px-8 py-4 text-base font-semibold text-white duration-300 rounded-xl bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:hover:bg-primary"
            >
              {status === 'loading' ? 'Enviando...' : 'Enviar mensaje'}
            </button>

            {status === 'success' && (
              <div className="mt-4 p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                <p className="text-center text-green-400">
                  ¡Gracias por tu feedback!
                </p>
              </div>
            )}
            
            {status === 'error' && (
              <div className="mt-4 p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                <p className="text-center text-red-400">
                  Hubo un error al enviar el mensaje. Por favor intenta de nuevo.
                </p>
              </div>
            )}
          </form>
        </div>
      </div>
    </section>
  );
};

export default ContactForm; 