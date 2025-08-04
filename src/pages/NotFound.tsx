
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Layout from '../components/Layout';

const NotFound = () => {
  return (
    <Layout>
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center">
        <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
        <div className="text-8xl animate-bounce mb-4">🙁</div>
        <h2 className="text-3xl mb-4">Página Não Encontrada</h2>
        <p className="text-lg text-gray-600 mb-8 max-w-md">
          Ops! Não conseguimos encontrar a página que você está procurando.
        </p>
        <Button asChild className="bg-primary text-white">
          <Link to="/">Voltar para a Página Inicial</Link>
        </Button>
      </div>
    </Layout>
  );
};

export default NotFound;
