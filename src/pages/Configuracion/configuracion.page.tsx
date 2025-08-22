import { FC, Fragment, useState } from "react";
import { Button, Card, Col, Row } from "react-bootstrap";
import Pageheader from "../../components/page/pageheader";
import ProjectsPage from "./Projects/projects.page";
import LabelsPage from "./Labels/labels.page";

interface ConfiguracionProps { }

const Configuracion: FC<ConfiguracionProps> = () => {
    const [showProjects, setShowProjects] = useState(false);
    const [showLabels, setShowLabels] = useState(false);

    const handleToggleProjects = () => {
        setShowProjects(!showProjects);
        setShowLabels(false); // Oculta el otro componente
    }

    const handleToggleLabels = () => {
        setShowLabels(!showLabels);
        setShowProjects(false); // Oculta el otro componente
    }

return (
        <div className="main-content app-content">
            <div className="container-fluid">
                <Fragment>
                    <Row>
                        <Col xl={12}>
                            <Card className="custom-card">
                                <Card.Header>
                                    <Card.Title>
                                        Configuración General
                                    </Card.Title>
                                </Card.Header>
                                <Card.Body>
                                    <p>A continuación se muestran las diferentes configuraciones que puedes realizar en el sistema.</p>
                                    <div className="btn-list">
                                        <Button variant="primary" onClick={handleToggleProjects}>
                                            Proyectos
                                        </Button>

                                        <Button variant="secondary" onClick={handleToggleLabels}>
                                            Etiquetas
                                        </Button>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>

                    {showProjects && (
                        <Row className="mt-4">
                            <Col xl={12}>
                                <ProjectsPage />
                            </Col>
                        </Row>
                    )}

                    {showLabels && (
                        <Row className="mt-4">
                            <Col xl={12}>
                                <LabelsPage />
                            </Col>
                        </Row>
                    )}
                </Fragment>
            </div>
        </div>
    )
}
export default Configuracion;