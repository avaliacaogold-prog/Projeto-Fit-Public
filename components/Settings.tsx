
import React, { useState } from 'react';
import { ProfessionalProfile } from '../types';

interface SettingsProps {
  profile: ProfessionalProfile;
  onUpdateProfile: (profile: ProfessionalProfile) => void;
}

const Settings: React.FC<SettingsProps> = ({ profile, onUpdateProfile }) => {
  const [formData, setFormData] = useState<ProfessionalProfile>(profile);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  const formatPhone = (value: string) => {
    // Remove tudo que não for número
    const numbers = value.replace(/\D/g, '');
    
    // Limita a 11 dígitos
    const limited = numbers.slice(0, 11);
    
    // Aplica a máscara (XX) XXXXX-XXXX
    if (limited.length <= 2) return limited;
    if (limited.length <= 7) return `(${limited.slice(0, 2)}) ${limited.slice(2)}`;
    return `(${limited.slice(0, 2)}) ${limited.slice(2, 7)}-${limited.slice(7, 11)}`;
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveStatus('saving');
    onUpdateProfile(formData);
    setTimeout(() => {
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }, 800);
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, logoUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEmailChange = (value: string) => {
    // Força lowercase e remove espaços
    const sanitizedEmail = value.toLowerCase().replace(/\s/g, '');
    setFormData({ ...formData, email: sanitizedEmail });
  };

  const handlePhoneChange = (value: string) => {
    const maskedPhone = formatPhone(value);
    setFormData({ ...formData, phone: maskedPhone });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in duration-500">
      <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
          <span className="text-9xl">⚙️</span>
        </div>
        
        <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase mb-2">Configurações do Sistema</h2>
        <p className="text-slate-400 font-medium text-sm mb-10">Personalize sua identidade profissional e como os laudos são gerados.</p>

        <form onSubmit={handleSave} className="space-y-12">
          {/* Seção Logo */}
          <div className="flex flex-col md:flex-row items-center gap-10 bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100">
            <div className="relative group">
              <div className="w-32 h-32 bg-white rounded-[2rem] border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden shadow-inner group-hover:border-indigo-400 transition-colors">
                {formData.logoUrl ? (
                  <img src={formData.logoUrl} alt="Logo Profissional" className="w-full h-full object-contain" />
                ) : (
                  <span className="text-4xl">📸</span>
                )}
              </div>
              <input 
                type="file" 
                accept="image/*" 
                className="absolute inset-0 opacity-0 cursor-pointer" 
                onChange={handleLogoChange}
              />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h4 className="font-black text-slate-800 text-sm uppercase tracking-widest mb-1">Logotipo Profissional</h4>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-4">Recomendado: PNG fundo transparente (400x400px)</p>
              <button type="button" className="text-indigo-600 font-black text-[10px] uppercase tracking-widest hover:text-indigo-700">Alterar Imagem</button>
            </div>
          </div>

          {/* Dados Cadastrais */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <SettingsInput 
              label="Nome Completo" 
              value={formData.name} 
              onChange={(v: string) => setFormData({...formData, name: v})} 
            />
            <SettingsInput 
              label="Nº Inscrição CREF" 
              placeholder="Ex: 123456-G/SP"
              value={formData.cref} 
              onChange={(v: string) => setFormData({...formData, cref: v})} 
            />
            <SettingsInput 
              label="E-mail de Contato" 
              type="email"
              placeholder="seu@email.com"
              value={formData.email} 
              onChange={handleEmailChange} 
            />
            <SettingsInput 
              label="WhatsApp Profissional" 
              placeholder="(00) 00000-0000"
              value={formData.phone} 
              onChange={handlePhoneChange} 
            />
            <div className="md:col-span-2">
              <SettingsInput 
                label="Endereço Comercial / Unidade" 
                value={formData.address} 
                onChange={(v: string) => setFormData({...formData, address: v})} 
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-2">Breve Apresentação / Bio</label>
              <textarea 
                className="w-full p-6 bg-slate-50 border border-slate-200 rounded-[2rem] font-bold text-xs outline-none focus:ring-2 focus:ring-indigo-500 min-h-[120px]"
                value={formData.bio}
                onChange={e => setFormData({...formData, bio: e.target.value})}
                placeholder="Conte um pouco sobre sua formação e metodologia..."
              />
            </div>
          </div>

          <div className="flex justify-end pt-6 border-t border-slate-100">
            <button 
              type="submit" 
              disabled={saveStatus === 'saving'}
              className={`px-14 py-6 rounded-[2rem] font-black text-[11px] uppercase tracking-widest transition-all shadow-xl flex items-center gap-4 ${
                saveStatus === 'saved' ? 'bg-emerald-500 text-white' : 'bg-slate-900 text-white hover:bg-indigo-600'
              }`}
            >
              {saveStatus === 'saving' ? 'Salvando...' : saveStatus === 'saved' ? '✨ Alterações Salvas' : 'Salvar Configurações'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const SettingsInput = ({ label, value, onChange, type = "text", placeholder }: any) => (
  <div className="w-full">
    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-2">{label}</label>
    <input 
      type={type}
      placeholder={placeholder}
      className="w-full p-6 bg-slate-50 border border-slate-200 rounded-[2rem] font-bold text-xs outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
      value={value}
      onChange={e => onChange(e.target.value)}
    />
  </div>
);

export default Settings;
