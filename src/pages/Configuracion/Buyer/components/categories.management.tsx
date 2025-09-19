import React, { useEffect, useState } from 'react';
import { useBuyer } from '../../../../hooks/useBuyer';
import { QuestionCategory } from '../../../../models';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';

const CategoriesManagement = () => {
  const { questionCategories, fetchQuestionCategories, addQuestionCategory, editQuestionCategory, removeQuestionCategory, loading } = useBuyer();
  const [showModal, setShowModal] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<Partial<QuestionCategory> | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchQuestionCategories();
  }, []);

  const handleShowModal = (category?: QuestionCategory) => {
    if (category) {
      setCurrentCategory(category);
      setIsEditing(true);
    } else {
      setCurrentCategory({ name: '', orden: 0, state: 1 });
      setIsEditing(false);
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setCurrentCategory(null);
  };

  const handleSave = async () => {
    if (currentCategory) {
      if (isEditing && currentCategory.id) {
        await editQuestionCategory(currentCategory.id, currentCategory);
      } else {
        await addQuestionCategory(currentCategory);
      }
      handleCloseModal();
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta categoría?')) {
      await removeQuestionCategory(id);
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3>Gestionar Categorías de Preguntas</h3>
        <Button variant="primary" onClick={() => handleShowModal()}>
          Añadir Categoría
        </Button>
      </div>
      <div className="card-body">
        {loading && <p>Cargando...</p>}
        <ul className="list-group">
          {questionCategories.map((cat) => (
            <li key={cat.id} className="list-group-item d-flex justify-content-between align-items-center">
              {cat.name} (Orden: {cat.orden})
              <div>
                <Button variant="secondary" size="sm" onClick={() => handleShowModal(cat)}>
                  Editar
                </Button>
                <Button variant="danger" size="sm" className="ms-2" onClick={() => handleDelete(cat.id)}>
                  Eliminar
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>{isEditing ? 'Editar' : 'Añadir'} Categoría</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Nombre</Form.Label>
              <Form.Control
                type="text"
                value={currentCategory?.name || ''}
                onChange={(e) => setCurrentCategory({ ...currentCategory, name: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Orden</Form.Label>
              <Form.Control
                type="number"
                value={currentCategory?.orden || 0}
                onChange={(e) => setCurrentCategory({ ...currentCategory, orden: parseInt(e.target.value) })}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Cerrar
          </Button>
          <Button variant="primary" onClick={handleSave}>
            Guardar Cambios
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default CategoriesManagement;
