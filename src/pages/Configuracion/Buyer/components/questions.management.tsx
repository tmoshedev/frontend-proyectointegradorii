import React, { useEffect, useState } from 'react';
import { useBuyer } from '../../../../hooks/useBuyer';
import { Question, QuestionCategory, TypeQuestion } from '../../../../models';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';

const QuestionsManagement = () => {
  const { 
    questions, 
    fetchQuestions, 
    addQuestion, 
    editQuestion, 
    removeQuestion, 
    questionCategories, 
    fetchQuestionCategories, 
    typeQuestions, 
    fetchTypeQuestions, 
    loading 
  } = useBuyer();
  
  const [showModal, setShowModal] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<Partial<Question> | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchQuestions();
    fetchQuestionCategories();
    fetchTypeQuestions();
  }, []);

  const handleShowModal = (question?: Question) => {
    if (question) {
      setCurrentQuestion(question);
      setIsEditing(true);
    } else {
      setCurrentQuestion({ texto: '', question_category_id: 0, type_question_id: 0, opciones: '', orden: 0, state: 1 });
      setIsEditing(false);
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setCurrentQuestion(null);
  };

  const handleSave = async () => {
    if (currentQuestion) {
      if (isEditing && currentQuestion.id) {
        await editQuestion(currentQuestion.id, currentQuestion);
      } else {
        await addQuestion(currentQuestion);
      }
      handleCloseModal();
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta pregunta?')) {
      await removeQuestion(id);
    }
  };

  return (
    <div className="card mt-4">
      <div className="card-header">
        <h3>Gestionar Preguntas</h3>
        <Button variant="primary" onClick={() => handleShowModal()}>
          Añadir Pregunta
        </Button>
      </div>
      <div className="card-body">
        {loading && <p>Cargando...</p>}
        <ul className="list-group">
          {questions.map((q) => (
            <li key={q.id} className="list-group-item d-flex justify-content-between align-items-center">
              {q.texto}
              <div>
                <Button variant="secondary" size="sm" onClick={() => handleShowModal(q)}>
                  Editar
                </Button>
                <Button variant="danger" size="sm" className="ms-2" onClick={() => handleDelete(q.id)}>
                  Eliminar
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>{isEditing ? 'Editar' : 'Añadir'} Pregunta</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Texto de la pregunta</Form.Label>
              <Form.Control
                type="text"
                value={currentQuestion?.texto || ''}
                onChange={(e) => setCurrentQuestion({ ...currentQuestion, texto: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Categoría</Form.Label>
              <Form.Select
                value={currentQuestion?.question_category_id || ''}
                onChange={(e) => setCurrentQuestion({ ...currentQuestion, question_category_id: parseInt(e.target.value) })}
              >
                <option>Selecciona una categoría</option>
                {questionCategories.map((cat: QuestionCategory) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Tipo de Pregunta</Form.Label>
              <Form.Select
                value={currentQuestion?.type_question_id || ''}
                onChange={(e) => setCurrentQuestion({ ...currentQuestion, type_question_id: parseInt(e.target.value) })}
              >
                <option>Selecciona un tipo</option>
                {typeQuestions.map((type: TypeQuestion) => (
                  <option key={type.id} value={type.id}>{type.name}</option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Opciones (separadas por comas para selección múltiple)</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={currentQuestion?.opciones || ''}
                onChange={(e) => setCurrentQuestion({ ...currentQuestion, opciones: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Orden</Form.Label>
              <Form.Control
                type="number"
                value={currentQuestion?.orden || 0}
                onChange={(e) => setCurrentQuestion({ ...currentQuestion, orden: parseInt(e.target.value) })}
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

export default QuestionsManagement;
