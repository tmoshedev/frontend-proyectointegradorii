import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useQuestionCategories } from '../../../../hooks/useQuestionCategory';
import { useQuestions } from '../../../../hooks/useQuestion';
import { Question, QuestionCategory, TypeQuestion } from '../../../../models';
import { AppStore } from '../../../../redux/store';
import { SweetAlert } from '../../../../utilities';

// Componentes de UI
import { Button, Card, Form, Modal, Accordion, Alert, Table } from 'react-bootstrap';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useTypeQuestions } from '../../../../hooks';

const CategoriesManagement = () => {
  // --- HOOKS ---
  const {
    getQuestionCategory,
    storeQuestionCategory,
    updateQuestionCategory,
    deleteQuestionCategory
  } = useQuestionCategories();

  const {
    getQuestion,
    storeQuestion,
    updateQuestion,
    deleteQuestion,
  } = useQuestions();

  const {
    getTypeQuestion
  } = useTypeQuestions();

  // --- REDUX STATE ---
  const { loading } = useSelector((store: AppStore) => store.loading);

  // --- COMPONENT STATE ---
  const [categories, setCategories] = useState<QuestionCategory[]>([]);
  const [isCategoriesLoading, setCategoriesLoading] = useState(true);
  const [questionsByCat, setQuestionsByCat] = useState<Record<number, Question[]>>({});
  const [typeQuestions, setTypeQuestions] = useState<TypeQuestion[]>([]);
  const [activeAccordionKey, setActiveAccordionKey] = useState<string | null>(null);
  const [isQuestionsLoading, setQuestionsLoading] = useState<Record<number, boolean>>({});

  // Modals State
  const [modalState, setModalState] = useState<{
    show: boolean;
    mode: 'create' | 'edit';
    type: 'category' | 'question';
    data: any;
  }>({ show: false, mode: 'create', type: 'category', data: null });

  // --- DATA FETCHING ---
  useEffect(() => {
    setCategoriesLoading(true);
    getQuestionCategory('', '', 1, '100', 'orden', 'asc', true, true)
      .then(response => {
        const res = response as { data: QuestionCategory[] };
        setCategories(res.data || []);
      })
      .catch(() => setCategories([]))
      .finally(() => setCategoriesLoading(false));

    getTypeQuestion('', '', 1, '100', 'id', 'asc', true).then(response => {
      const res = response as { data: TypeQuestion[] };
      setTypeQuestions(res.data);
    });
  }, []);

  const handleAccordionToggle = async (categoryId: number, eventKey: string) => {
    const newActiveKey = activeAccordionKey === eventKey ? null : eventKey;
    setActiveAccordionKey(newActiveKey);

    if (newActiveKey && !questionsByCat[categoryId]) {
      setQuestionsLoading(prev => ({ ...prev, [categoryId]: true }));
      try {
        const response = await getQuestion(String(categoryId), '', '', 1, '100', 'orden', 'asc', true, true, 'type_question');
        const res = response as { data: Question[] };
        setQuestionsByCat(prev => ({ ...prev, [categoryId]: res.data }));
      } finally {
        setQuestionsLoading(prev => ({ ...prev, [categoryId]: false }));
      }
    }
  };

  // --- MODAL HANDLERS ---
  const handleShowModal = (type: 'category' | 'question', mode: 'create' | 'edit', data: any = null) => {
    let initialData = {};
    if (mode === 'create') {
      if (type === 'category') {
        const nextOrder = categories.length > 0 ? Math.max(...categories.map((c: QuestionCategory) => c.orden)) + 10 : 10;
        initialData = { name: '', orden: nextOrder };
      } else { // question
        initialData = { question_category_id: data.categoryId, texto: '', type_question_id: '', opciones: '', orden: 10 };
      }
    } else {
      initialData = { ...data };
    }
    setModalState({ show: true, type, mode, data: initialData });
  };

  const handleCloseModal = () => {
    setModalState({ show: false, mode: 'create', type: 'category', data: null });
  };

  const handleModalChange = (field: string, value: any) => {
    setModalState(prev => ({ ...prev, data: { ...prev.data, [field]: value } }));
  };

  // --- CRUD OPERATIONS ---
  const handleSave = async () => {
    const { type, mode, data } = modalState;

    try {
      if (type === 'category') {
        if (!data.name) {
          SweetAlert.warning('Validación', 'El nombre de la categoría es obligatorio.');
          return;
        }
        let response;
        if (mode === 'edit') {
          response = await updateQuestionCategory(data.id, data.name, data.orden || 0);
        } else {
          response = await storeQuestionCategory(data.name, data.orden || 0);
        }
        const res = response as { question_category: QuestionCategory };
        const updatedCategories = mode === 'edit'
          ? categories.map(c => c.id === res.question_category.id ? res.question_category : c)
          : [...categories, res.question_category];
        
        setCategories(updatedCategories.sort((a, b) => a.orden - b.orden));
        SweetAlert.success('Éxito', 'Categoría guardada correctamente.');
      }
      else if (type === 'question') {
        if (!data.texto || !data.type_question_id) {
          SweetAlert.warning('Validación', 'El texto y el tipo de pregunta son obligatorios.');
          return;
        }
        if (mode === 'edit') {
          await updateQuestion(
            data.id,
            data.type_question_id,
            data.texto,
            data.opciones,
            data.orden
          );
        } else {
          await storeQuestion(
            data.type_question_id,
            data.texto,
            data.question_category_id,
            data.opciones,
            data.orden
          );
        }
        // Recargar preguntas para la categoría afectada
        const response = await getQuestion(String(data.question_category_id), '', '', 1, '100', 'orden', 'asc', true, true, 'type_question');
        const res = response as { data: Question[] };
        setQuestionsByCat(prev => ({ ...prev, [data.question_category_id]: res.data }));
        SweetAlert.success('Éxito', 'Pregunta guardada correctamente.');
      }
      handleCloseModal();
    } catch (error) {
      SweetAlert.error('Error', `Ocurrió un error al guardar.`);
    }
  };

  const handleDelete = async (type: 'category' | 'question', id: number, categoryId?: number) => {
    SweetAlert.onConfirmation(async () => {
      try {
        if (type === 'category') {
          await deleteQuestionCategory(id);
          setCategories(prev => prev.filter(c => c.id !== id));
        } else {
          await deleteQuestion(id);
          if (categoryId) {
            const response = await getQuestion(String(categoryId), '', '', 1, '100', 'orden', 'asc', true, true, 'type_question');
            const res = response as { data: Question[] };
            setQuestionsByCat(prev => ({ ...prev, [categoryId]: res.data }));
          }
        }
        SweetAlert.success('Eliminado', 'El registro ha sido eliminado.');
      } catch (error) {
        SweetAlert.error('Error', 'No se pudo eliminar el registro.');
      }
    }, undefined, '¿Estás seguro?', 'Esta acción no se puede deshacer.');
  };

  // --- RENDER ---
  const renderQuestionModal = () => {
    const selectedType = typeQuestions.find(tq => tq.id === modalState.data?.type_question_id);
    const showOptions = selectedType && (selectedType.codigo === 'SELECT' || selectedType.codigo === 'CHECKBOX');

    return (
      <Form>
        <Form.Group className="mb-3">
          <Form.Label>Texto de la Pregunta</Form.Label>
          <Form.Control type="text" value={modalState.data?.texto || ''} onChange={(e) => handleModalChange('texto', e.target.value)} autoFocus />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Tipo de Pregunta</Form.Label>
          <Form.Select value={modalState.data?.type_question_id || ''} onChange={(e) => handleModalChange('type_question_id', parseInt(e.target.value))}>
            <option value="">Selecciona un tipo</option>
            {typeQuestions.map(tq => <option key={tq.id} value={tq.id}>{tq.name}</option>)}
          </Form.Select>
        </Form.Group>
        {showOptions && (
          <Form.Group className="mb-3">
            <Form.Label>Opciones (separadas por coma)</Form.Label>
            <Form.Control as="textarea" rows={2} value={modalState.data?.opciones || ''} onChange={(e) => handleModalChange('opciones', e.target.value)} />
          </Form.Group>
        )}
        <Form.Group>
          <Form.Label>Orden</Form.Label>
          <Form.Control type="number" value={modalState.data?.orden || ''} onChange={(e) => handleModalChange('orden', parseInt(e.target.value) || 0)} />
        </Form.Group>
      </Form>
    );
  }

  return (
    <Card className="shadow-sm">
      <Card.Header className="d-flex justify-content-between align-items-center">
        <Card.Title as="h5" className="mb-0">Configuración del Formulario Buyer</Card.Title>
        <Button variant="primary" onClick={() => handleShowModal('category', 'create')}>
          <Plus size={18} className="me-1" />
          Añadir Categoría
        </Button>
      </Card.Header>
      <Card.Body>
        {isCategoriesLoading && <p>Cargando...</p>}
        {!isCategoriesLoading && categories.length === 0 && <Alert variant="info">No hay categorías. ¡Crea la primera!</Alert>}

        <Accordion
          activeKey={activeAccordionKey}
          onSelect={(eventKey) => {
            const key = eventKey as string | null;
            if (key) {
              handleAccordionToggle(Number(key), key);
            } else {
              setActiveAccordionKey(null);
            }
          }}
        >
          {Array.isArray(categories) && categories.map((cat: QuestionCategory) => (
            <Accordion.Item eventKey={String(cat.id)} key={cat.id}>
              <div className="d-flex align-items-center">
                <Accordion.Header className="flex-grow-1">
                  {cat.name} (Orden: {cat.orden})
                </Accordion.Header>
                <div className="p-2">
                  <Button variant="outline-primary" size="sm" className="me-2" onClick={() => handleShowModal('category', 'edit', cat)}>
                    <Pencil size={14} />
                  </Button>
                  <Button variant="outline-danger" size="sm" onClick={() => handleDelete('category', cat.id)}>
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>
              <Accordion.Body>
                <h5>Preguntas en esta Categoría</h5>
                <Button variant="success" size="sm" className="mb-3" onClick={() => handleShowModal('question', 'create', { categoryId: cat.id })}>
                  <Plus size={16} /> Añadir Pregunta
                </Button>

                {isQuestionsLoading[cat.id] && <p>Cargando preguntas...</p>}

                {!isQuestionsLoading[cat.id] && questionsByCat[cat.id] && questionsByCat[cat.id].length > 0 ? (
                  <Table striped bordered hover size="sm">
                    <thead><tr><th>Pregunta</th><th>Tipo</th><th>Orden</th><th className="text-end">Acciones</th></tr></thead>
                    <tbody>
                      {[...questionsByCat[cat.id]].sort((a, b) => a.orden - b.orden).map(q => (
                        <tr key={q.id}>
                          <td>{q.texto}</td>
                          <td>{q.name_type}</td>
                          <td>{q.orden}</td>
                          <td className="text-end">
                            <Button variant="outline-primary" size="sm" className="me-2" onClick={() => handleShowModal('question', 'edit', q)}><Pencil size={14} /></Button>
                            <Button variant="outline-danger" size="sm" onClick={() => handleDelete('question', q.id, cat.id)}><Trash2 size={14} /></Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                ) : (
                  !isQuestionsLoading[cat.id] && <Alert variant="secondary" className="mt-2">No hay preguntas en esta categoría.</Alert>
                )}
              </Accordion.Body>
            </Accordion.Item>
          ))}
        </Accordion>
      </Card.Body>

      {/* --- MODAL UNIVERSAL --- */}
      <Modal show={modalState.show} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>{modalState.mode === 'edit' ? 'Editar' : 'Añadir'} {modalState.type === 'category' ? 'Categoría' : 'Pregunta'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {modalState.type === 'category' ? (
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Nombre de la Categoría</Form.Label>
                <Form.Control type="text" value={modalState.data?.name || ''} onChange={(e) => handleModalChange('name', e.target.value)} autoFocus />
              </Form.Group>
              <Form.Group><Form.Label>Orden</Form.Label><Form.Control type="number" value={modalState.data?.orden || ''} onChange={(e) => handleModalChange('orden', parseInt(e.target.value) || 0)} /></Form.Group>
            </Form>
          ) : (
            renderQuestionModal()
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>Cancelar</Button>
          <Button variant="primary" onClick={handleSave} disabled={loading}>{loading ? 'Guardando...' : 'Guardar'}</Button>
        </Modal.Footer>
      </Modal>
    </Card>
  );
};

export default CategoriesManagement;