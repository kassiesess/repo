import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Loader2 } from 'lucide-react';
import VerificationFlow from '../components/verification/VerificationFlow';

export default function Verification() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      // If already verified or pending, redirect to home
      if (u.verification_status === 'approved') {
        navigate(createPageUrl('Home'));
      }
    }).catch(() => {
      // Not authenticated, redirect to home
      navigate(createPageUrl('Home'));
    });
  }, [navigate]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <VerificationFlow 
      user={user}
      onComplete={() => {
        navigate(createPageUrl('Home'));
      }}
    />
  );
}