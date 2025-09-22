import React from 'react';
import CategoriesManagement from './components/categories.management';

const BuyerPage = () => {
  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12">
          {/* Este es ahora nuestro componente principal y único para esta vista */}
          <CategoriesManagement />
        </div>
      </div>
    </div>
  );
};

export default BuyerPage;