import { useState, useEffect, ChangeEvent } from 'react';
import { Form, Button, Alert, Card, Spinner, ListGroup, Row, Col } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { Save } from 'lucide-react';
import { useQuestionCategories } from '../../../hooks/useQuestionCategory';
import { useQuestions } from '../../../hooks/useQuestion';
import { Answer, Question, QuestionCategory } from '../../../models';
import { AppStore } from '../../../redux/store';
import { PaginatedResponse } from '../../../models/responses/paginated.response';
import { useAnswers } from '../../../hooks/useAnswer';
import { SweetAlert } from '../../../utilities';


interface Props {
  changeHistorialView: (view: string) => void;
}

// Nueva estructura para el estado de las answers
interface AnswerState {
  value: any;
  answer_id: number | null; // ID de la answer si ya existe
}

export const LeadBuyerComponent = ({ changeHistorialView }: Props) => {
  const { lead } = useSelector((store: AppStore) => store.lead);
  const { user } = useSelector((store: AppStore) => store.auth);
  const { getQuestionCategory } = useQuestionCategories();
  const { getQuestion } = useQuestions();
  const { getAnswer, storeAnswer, updateAnswer } = useAnswers();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<QuestionCategory[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<QuestionCategory | null>(null);
  const [answers, setAnswers] = useState<{ [key: string]: AnswerState }>({});

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        // 1. Cargar categorías
        const categoryResponse = await getQuestionCategory('', '', 1, '100', 'order', 'asc', false) as PaginatedResponse<QuestionCategory>;
        let sortedCategories: QuestionCategory[] = [];
        if (categoryResponse && categoryResponse.data) {
          sortedCategories = categoryResponse.data.sort((a, b) => a.order - b.order);
          setCategories(sortedCategories);
        }
        // 2. Cargar preguntas de la primera categoría
        let loadedQuestions: Question[] = [];
        if (sortedCategories.length > 0) {
          setSelectedCategory(sortedCategories[0]);
          const response = await getQuestion(String(sortedCategories[0].id), '', '', 1, '100', 'order', 'asc', false, false, 'type_question') as PaginatedResponse<Question>;
          if (response && response.data) {
            loadedQuestions = response.data.sort((a, b) => a.order - b.order);
            setQuestions(loadedQuestions);
          } else {
            setQuestions([]);
          }
        }
        // 3. Cargar answers y normalizar usando las preguntas
        const answerResponse = await getAnswer(String(lead.id), '', '', 1, '500', 'id', 'asc', false) as PaginatedResponse<Answer>;
        if (answerResponse && answerResponse.data) {
          const initialAnswers = answerResponse.data.reduce((acc, ans) => {
            let value: any = ans.answer;
            try {
              value = JSON.parse(value);
            } catch (e) {
              if (value === 'true') value = true;
              else if (value === 'false') value = false;
            }
            // Buscar la pregunta correspondiente para saber el tipo
            const question = loadedQuestions.find(q => String(q.id) === String(ans.question_id));
            let normalizedValue = value;
            if (question) {
              switch (question.code_type) {
                case 'SELECT':
                  if (typeof value === 'object' && value !== null && 'selected' in value) {
                    normalizedValue = value.selected ?? '';
                  } else {
                    normalizedValue = typeof value === 'string' ? value : '';
                  }
                  break;
                case 'CHECKBOX':
                  if (Array.isArray(value)) {
                    normalizedValue = { selected: value, otherValue: '' };
                  } else if (typeof value === 'object' && value !== null) {
                    // Soportar claves en mayúsculas y minúsculas
                    const selected = value.selected ?? value.SELECTED ?? [];
                    const otherValue = value.otherValue ?? value.OTHERVALUE ?? '';
                    normalizedValue = {
                      selected,
                      otherValue
                    };
                  } else if (typeof value === 'string') {
                    normalizedValue = { selected: [value], otherValue: '' };
                  }
                  break;
                case 'BOOLEAN':
                  if (typeof value === 'string') {
                    normalizedValue = value === 'true';
                  }
                  break;
                default:
                  break;
              }
            }
            if (ans.question_id !== null && ans.question_id !== undefined) {
              acc[ans.question_id] = { value: normalizedValue, answer_id: ans.id };
            }
            return acc;
          }, {} as { [key: string]: AnswerState });
          setAnswers(initialAnswers);
        }
      } catch (err) {
        setError('Error al cargar los datos iniciales.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (lead?.id) {
      fetchInitialData();
    }
  }, [lead]);

  const handleCategoryClick = async (category: QuestionCategory) => {
    if (selectedCategory?.id === category.id) return;
    try {
      setLoading(true);
      setSelectedCategory(category);
      const response = await getQuestion(String(category.id), '', '', 1, '100', 'order', 'asc', false, false, 'type_question') as PaginatedResponse<Question>;
      let loadedQuestions: Question[] = [];
      if (response && response.data) {
        loadedQuestions = response.data.sort((a, b) => a.order - b.order);
        setQuestions(loadedQuestions);
      } else {
        setQuestions([]);
      }
      // Cargar y normalizar answers para las preguntas de la categoría seleccionada
      const answerResponse = await getAnswer(String(lead.id), '', '', 1, '500', 'id', 'asc', false) as PaginatedResponse<Answer>;
      if (answerResponse && answerResponse.data) {
        const initialAnswers = answerResponse.data.reduce((acc, ans) => {
          let value: any = ans.answer;
          try {
            value = JSON.parse(value);
          } catch (e) {
            if (value === 'true') value = true;
            else if (value === 'false') value = false;
          }
          // Buscar la pregunta correspondiente para saber el tipo
          const question = loadedQuestions.find(q => String(q.id) === String(ans.question_id));
          let normalizedValue = value;
          if (question) {
            switch (question.code_type) {
              case 'SELECT':
                if (typeof value === 'object' && value !== null && 'selected' in value) {
                  normalizedValue = value.selected ?? '';
                } else {
                  normalizedValue = typeof value === 'string' ? value : '';
                }
                break;
              case 'CHECKBOX':
                if (Array.isArray(value)) {
                  normalizedValue = { selected: value, otherValue: '' };
                } else if (typeof value === 'object' && value !== null) {
                  // Soportar claves en mayúsculas y minúsculas
                  const selected = value.selected ?? value.SELECTED ?? [];
                  const otherValue = value.otherValue ?? value.OTHERVALUE ?? '';
                  normalizedValue = {
                    selected,
                    otherValue
                  };
                } else if (typeof value === 'string') {
                  normalizedValue = { selected: [value], otherValue: '' };
                }
                break;
              case 'BOOLEAN':
                if (typeof value === 'string') {
                  normalizedValue = value === 'true';
                }
                break;
              default:
                break;
            }
          }
          if (ans.question_id !== null && ans.question_id !== undefined) {
            acc[ans.question_id] = { value: normalizedValue, answer_id: ans.id };
          }
          return acc;
        }, {} as { [key: string]: AnswerState });
        setAnswers(initialAnswers);
      } else {
        setAnswers({});
      }
    } catch (err) {
      setError(`Error al cargar las preguntas para ${category.name}.`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId: string, value: any, type?: string) => {
    setAnswers(prev => {
      const newAnswers = { ...prev };
      const existingAnswer = newAnswers[questionId] || { value: undefined, answer_id: null };

      let finalValue;

      switch (type) {
        case 'CHECKBOX': {
          // Lógica corregida y más robusta
          const currentSelected = existingAnswer.value?.selected || [];
          const otherValue = existingAnswer.value?.otherValue || '';
          const newSelected = currentSelected.includes(value)
            ? currentSelected.filter((item: any) => item !== value)
            : [...currentSelected, value];
          finalValue = { selected: newSelected, otherValue: otherValue };
          break;
        }

        case 'CHECKBOX_OTHER': {
          // Aseguramos que 'selected' se mantenga
          const currentSelected = existingAnswer.value?.selected || [];
          finalValue = { selected: currentSelected, otherValue: value };
          break;
        }

        case 'SELECT': {
          // Solo guardar el valor seleccionado
          finalValue = value;
          break;
        }

        default:
          finalValue = value;
          break;
      }

      newAnswers[questionId] = { ...existingAnswer, value: finalValue };
      return newAnswers;
    });
  };

  const submitAnswers = async () => {
    if (!user) {
      SweetAlert.error('Error de Autenticación', 'No se pudo identificar al usuario. Por favor, inicie sesión de nuevo.');
      return;
    }

    setLoading(true);
    const promises: Promise<any>[] = [];

    Object.entries(answers).forEach(([questionId, answerState]) => {
      if (answerState.value === undefined || answerState.value === null) return;

      // Buscar la pregunta para saber el tipo
      const question = questions.find(q => String(q.id) === String(questionId));

      if (question && question.code_type === 'IMAGE' && answerState.value instanceof File) {
        // Guardar solo el nombre del archivo como answer
        const answer = answerState.value.name;
        if (answerState.answer_id) {
          promises.push(updateAnswer(answerState.answer_id, answer));
        } else {
          promises.push(storeAnswer(questionId, String(lead.id), String(user.id), answer));
        }
      } else {
        let answer: string;
        if (typeof answerState.value === 'object' && answerState.value !== null && !(answerState.value instanceof File)) {
          answer = JSON.stringify(answerState.value);
        } else if (typeof answerState.value === 'boolean') {
          answer = answerState.value ? 'true' : 'false';
        } else {
          answer = String(answerState.value);
        }
        if (answerState.answer_id) {
          promises.push(updateAnswer(answerState.answer_id, answer));
        } else {
          promises.push(storeAnswer(questionId, String(lead.id), String(user.id), answer));
        }
      }
    });

    if (promises.length === 0) {
      SweetAlert.info('Sin Cambios', 'No hay nuevas answers o cambios para guardar.');
      setLoading(false);
      return;
    }

    try {
      await Promise.all(promises);
      SweetAlert.success('Éxito', 'answers guardadas correctamente.');
    } catch (err) {
      console.error('Error al guardar las answers:', err);
      SweetAlert.error('Error', 'Ocurrió un error al guardar las answers. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  // ... (código anterior del componente)

  const renderQuestionInput = (question: Question) => {
    const answerState = answers[question.id];
    const answerValue = answerState?.value;
    const questionIdStr = String(question.id);



    // --- LÓGICA MEJORADA PARA OBTENER LAS options ---
    const getOptions = (options: string | string[] | null): string[] => {
      if (!options) {
        return [];
      }
      // Si ya es un array (el backend lo envía como JSON), lo usamos directamente.
      if (Array.isArray(options)) {
        return options;
      }
      // Si es una cadena, lo dividimos.
      if (typeof options === 'string') {
        return options.split(',').map(opt => opt.trim());
      }
      return [];
    };

    switch (question.code_type) {
      case 'TEXT':
        return <Form.Control type="text" value={answerValue ?? ''} onChange={(e) => handleAnswerChange(questionIdStr, e.target.value)} placeholder="answer corta..." />;

      case 'TEXTAREA':
        return <Form.Control as="textarea" rows={3} value={answerValue ?? ''} onChange={(e) => handleAnswerChange(questionIdStr, e.target.value)} placeholder="Párrafo..." />;

      case 'BOOLEAN':
        return (
          <div>
            <Form.Check inline type="radio" label="Sí" name={`question-${question.id}`} id={`question-${question.id}-yes`} checked={answerValue === true} onChange={() => handleAnswerChange(questionIdStr, true)} />
            <Form.Check inline type="radio" label="No" name={`question-${question.id}`} id={`question-${question.id}-no`} checked={answerValue === false} onChange={() => handleAnswerChange(questionIdStr, false)} />
          </div>
        );

      case 'SELECT': {
        const options = getOptions(question.options);
        // Normalizar el valor guardado para comparar correctamente
        const normalize = (str: any) => typeof str === 'string' ? str.trim().toLowerCase() : '';
        // Extraer el valor seleccionado, soportando string o { selected: ... }
        let selectedValue = '';
        if (typeof answerValue === 'object' && answerValue !== null && 'selected' in answerValue) {
          selectedValue = answerValue.selected ?? '';
        } else {
          selectedValue = answerValue ?? '';
        }
        // Buscar la opción que coincide con el valor guardado
        let matchedOption = options.find(opt => normalize(opt) === normalize(selectedValue));
        // Si hay coincidencia, usar el valor exacto de la opción, si no, usar el valor guardado
        selectedValue = matchedOption ?? selectedValue;
        return (
          <Form.Select value={selectedValue} onChange={(e) => handleAnswerChange(questionIdStr, e.target.value, 'SELECT')}>
            <option value="">Seleccione una opción</option>
            {options.map((opt, index) => (
              <option key={index} value={opt}>{opt}</option>
            ))}
          </Form.Select>
        );
      }

      case 'CHECKBOX': {
        // Lógica de options con 'Otro' por defecto
        let checkOptions = Array.isArray(question.options)
          ? question.options
          : (typeof question.options === 'string' ? question.options.split(',').map(opt => opt.trim()) : []);
        // Agregar 'Otro' si no existe
        if (!checkOptions.includes('Otro')) {
          checkOptions = [...checkOptions, 'Otro'];
        }

        // Normalizar los valores seleccionados para que coincidan con las options
        const selectedValuesRaw = answerValue?.selected || [];
        // Convertir todo a minúsculas y sin espacios para comparar
        const normalize = (str: string) => str.trim().toLowerCase();
        const selectedValues = selectedValuesRaw.map(normalize);
        const otherValue = answerValue?.otherValue ?? '';
        // Renderizar los checkboxes normales, incluyendo 'Otro' como opción seleccionable
        return (
          <div>
            {checkOptions.map((optionText) => (
              <Form.Check
                key={`${question.id}-${optionText}`}
                type="checkbox"
                id={`question-${question.id}-${optionText.replace(/\s+/g, '-')}`}
                label={optionText}
                checked={selectedValues.includes(normalize(optionText))}
                onChange={() => handleAnswerChange(questionIdStr, optionText, 'CHECKBOX')}
              />
            ))}
            {/* Si 'Otro' está seleccionado, mostrar el input de question */}
            {selectedValues.includes(normalize('Otro')) && (
              <Form.Control
                type="text"
                className="mt-2"
                placeholder="Por favor, especifique"
                value={otherValue}
                onChange={(e) => handleAnswerChange(questionIdStr, e.target.value, 'CHECKBOX_OTHER')}
              />
            )}
          </div>
        );
      }

      case 'RADIO': {
  // options + 'Otro'
  let radioOptions = Array.isArray(question.options)
    ? question.options
    : (typeof question.options === 'string' ? question.options.split(',').map(opt => opt.trim()) : []);
  // Normaliza todas las options para evitar problemas de mayúsculas/minúsculas
  const normalize = (str: string) => str.trim().toLowerCase();
  if (!radioOptions.some(opt => normalize(opt) === 'otro')) {
    radioOptions = [...radioOptions, 'Otro'];
  }
  // Extraer valor seleccionado y valor de 'Otro'
  let selectedValue = '';
  let otherValue = '';
  if (typeof answerValue === 'object' && answerValue !== null) {
    selectedValue = answerValue.selected ?? answerValue.SELECTED ?? '';
    otherValue = answerValue.otherValue ?? answerValue.OTHERVALUE ?? '';
  } else {
    selectedValue = answerValue ?? '';
  }
  // Normaliza el valor seleccionado para comparar correctamente
  const isOtroSelected = normalize(selectedValue) === 'otro';

  return (
    <div>
      {radioOptions.map((optionText) => (
        <Form.Check
          key={`${question.id}-${optionText}`}
          type="radio"
          name={`question-${question.id}`}
          id={`question-${question.id}-${optionText.replace(/\s+/g, '-')}`}
          label={optionText}
          checked={normalize(selectedValue) === normalize(optionText)}
          onChange={() => handleAnswerChange(questionIdStr, { selected: optionText, otherValue: '' }, 'RADIO')}
        />
      ))}
      {/* Si 'Otro' está seleccionado, mostrar el input de question */}
      {isOtroSelected && (
        <Form.Control
          type="text"
          className="mt-2"
          placeholder="Por favor, especifique"
          value={otherValue}
          onChange={(e) => handleAnswerChange(questionIdStr, { selected: 'Otro', otherValue: e.target.value }, 'RADIO')}
        />
      )}
    </div>
  );
}

      case 'NUMBER':
        return <Form.Control type="number" value={answerValue ?? ''} onChange={(e) => handleAnswerChange(questionIdStr, e.target.value)} placeholder="Escriba un número..." />;

      case 'DATE':
        return <Form.Control type="date" value={answerValue ?? ''} onChange={(e) => handleAnswerChange(questionIdStr, e.target.value)} />;

      case 'IMAGE': {
        const isFile = answerValue instanceof File;
        const imageUrl = isFile ? URL.createObjectURL(answerValue) : (typeof answerValue === 'string' && answerValue ? answerValue : null);
        return (
          <div>
            <Form.Control type="file" accept="image/*" onChange={(e: ChangeEvent<HTMLInputElement>) => handleAnswerChange(questionIdStr, e.target.files ? e.target.files[0] : null)} />
            {imageUrl && (
              <div className="mt-2">
                <img src={imageUrl} alt="Vista previa" style={{ maxWidth: '200px', maxHeight: '200px', borderRadius: '8px' }} />
              </div>
            )}
          </div>
        );
      }

      default:
        return <p className="text-danger small">Tipo de pregunta no soportado: {question.name_type || 'desconocido'}</p>;
    }
  };

  // ... (resto del componente)

  if (loading && categories.length === 0) {
    return (
      <div className="d-flex justify-content-center align-items-center p-5">
        <Spinner animation="border" />
        <span className="ms-3">Cargando formulario...</span>
      </div>
    );
  }

  if (error) {
    return <Alert variant="danger" className="m-3">{error}</Alert>;
  }

  if (categories.length === 0) {
    return <Alert variant="info" className="m-3">Pronto se subirán nuevas preguntas para el formulario Buyer. ¡Vuelve a intentarlo más tarde!</Alert>
  }

  return (
    <div className="timeline_tabs__content">
    <Card className="lead-actividad">
      <Card.Body>
        <Row>
          <Col md={4} >
            <h5 className="fw-bold">CATEGORIAS</h5>
            <hr />
            <ListGroup>
              {categories.map(category => (
                <ListGroup.Item key={category.id} action active={selectedCategory?.id === category.id} onClick={() => handleCategoryClick(category)} className="d-flex justify-content-between align-items-start">
                  <span style={{ textTransform: 'uppercase' }}>{category.name}</span>
                </ListGroup.Item>
              ))}
            </ListGroup>
          </Col>
          <Col md={5} className='lead-actividad__right'>
            {loading && questions.length === 0 ? (
              <div className="d-flex justify-content-center align-items-center p-5">
                <Spinner animation="border" size="sm" />
                <span className="ms-3">Cargando preguntas...</span>
              </div>
            ) : (
              <>
                {questions.length > 0 ? (
                  <Form>
                    {questions.map(question => (
                      <Form.Group key={question.id} className="mb-4">
                        <Form.Label className="fw-bold">{question.question}</Form.Label>
                        {renderQuestionInput(question)}
                      </Form.Group>
                    ))}
                  </Form>
                ) : (
                  <Alert variant="light">No hay preguntas en esta categoría.</Alert>
                )}
              </>
            )}
          </Col>
        </Row>
        
      </Card.Body>
      
    </Card>
    <div className="lead-actividad__left-footer">
          <div className="lead-actividad__left-footer-right">
            <Button variant="success" onClick={submitAnswers} disabled={loading}>
              <Save size={16} className="me-2" />
              {loading ? 'Guardando...' : 'Guardar answers'}
            </Button>
          </div>
        </div>
    </div>
    
  );
};

export default LeadBuyerComponent;