import React from 'react';
import CategoriesManagement from './components/categories.management';
import QuestionsManagement from './components/questions.management';

const BuyerPage = () => {
  return (
    <div className="container-fluid">
      <h1 className="mt-4">Configuración del Buyer</h1>
      <p>Administra las categorías y preguntas que se mostrarán en el formulario del buyer.</p>
      <div className="row">
        <div className="col-md-6">
          <CategoriesManagement />
        </div>
        <div className="col-md-6">
          <QuestionsManagement />
        </div>
      </div>
    </div>
  );
};

export default BuyerPage;
