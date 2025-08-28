/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import PageBodyComponent from '../../../components/page/page-body.component';
import PageHeaderComponent from '../../../components/page/page-hader.component';
import { useProjects } from '../../../hooks/useProjects';
import FilterProjectsComponent from './components/filter-projects.component';
import ModalComponent from '../../../components/shared/modal.component';
import ProjectFormComponent from './components/project-form.component';
import TypeProjectFormComponent from './components/type-project-form.component';
import { SweetAlert } from '../../../utilities';
import { Project } from '../../../models';
import { storeTypeProject, updateTypeProject } from '../../../services/type-projects.service';

interface DataModalState {
  type: string;
  buttonSubmit: string | null;
  row: any | null;
  title: string | null;
  onCloseModalForm: any;
}

export const ProjectsPage = () => {
  // Refresca la lista de typeProjects sin recargar la página
  const onRefresh = () => {
    import('../../../services/type-projects.service').then(({ getTypeProjects }) => {
      getTypeProjects('', '', 1, '', '', '').then((res: any) => {
        setTypeProjects(res?.data || []);
      });
    });
    setIsOpenTypeProjectModal(false);
    setIsStateModal(false);
  };
  const [filterState, setFilterState] = useState({
    text: '',
    type: '',
    page: 1,
    limit: '',
    orderBy: '',
    order: '',
  });
  const { getProjects, storeProject, updateProject, deleteProject, stateProject } = useProjects();
  const [typeProjects, setTypeProjects] = useState([]);
  const [selectedTypeProject, setSelectedTypeProject] = useState<string>('');
  const [isOpenTypeProjectModal, setIsOpenTypeProjectModal] = useState(false);
  const [dataModalResourceStateTypeProject, setDataModalResourceStateTypeProject] = useState<DataModalState>({
    type: '',
    buttonSubmit: null,
    row: null,
    title: null,
    onCloseModalForm: () => { },
  });

  const [isOpenModal, setIsOpenModal] = useState(false);
  const [isStateModal, setIsStateModal] = useState(false);
  const [dataModalResourceState, setDataModalResourceState] = useState<DataModalState>({
    type: '',
    buttonSubmit: null,
    row: null,
    title: null,
    onCloseModalForm: () => { },
  });

  const state = {
    page: {
      title: 'Proyectos',
      model: 'projects',
      buttons: {
        create: true,
        edit: true,
        destroy: true,
      },
    },
    table: {
      body: {
        widthAccion: '',
        cols: [
          { name: 'name', alias: 'Nombre', roles: [] },
          {
            name: 'image',
            alias: 'Imagen',
            play: { type: 'image' }
          },

        ],
        buttons: [
          {/*
            name: 'status',
            tooltip: 'Desactivar Etiqueta',
            text: '',
            css: 'me-3 text-danger',
            icon: 'fa-solid fa-toggle-off',
            play: {
              type: 'states',
              name: 'state',
              values: {
                '0': false,
                '1': true,
              },
            },
          },
          {
            name: 'status_active',
            tooltip: 'Activar Etiqueta',
            text: '',
            css: 'me-3 text-success',
            icon: 'fa-solid fa-toggle-on',
            play: {
              type: 'states',
              name: 'state',
              values: {
                '0': true,
                '1': false,
              },
            },
          */},
        ],
      },
    },
  };

  const onClickButtonPersonalizado = (row: any, name: any) => {
    switch (name) {
      case 'status':
        onStatus(
          row,
          '¿Está seguro que desea desactivar el proyecto?',
          'Proyecto desactivado correctamente.'
        );
        break;
      case 'status_active':
        onStatus(
          row,
          '¿Está seguro que desea activar el proyecto?',
          'Proyecto activado correctamente.'
        );
        break;
      default:
        break;
    }
  };

  const onStatus = (row: any, text: string, message: string) => {
    SweetAlert.onConfirmation(
      () => handleState(row.id, message),
      () => { },
      text
    );
  };

  const handleState = (id: any, text: string) => {
    stateProject(parseInt(id, 10)).then(() => {
      SweetAlert.success(text);
    });
  };

  const onDelete = (row: Project) => {
    SweetAlert.onConfirmation(
      () => handleDelete(row.id, 'Proyecto eliminado correctamente.'),
      () => { },
      '¿Está seguro que desea eliminar el proyecto?',
      row.name
    );
  };

  const handleDelete = (id: any, text: string) => {
    deleteProject(parseInt(id, 10)).then(() => {
      SweetAlert.success(text);
    });
  };

  const onChangePage = (page: number, type: string) => {
    let newPage = page;
    if (type === 'prev') newPage = filterState.page - 1;
    if (type === 'next') newPage = filterState.page + 1;

    setFilterState({ ...filterState, page: newPage });

    getProjects(
      '',
      filterState.text,
      filterState.type,
      newPage,
      filterState.limit,
      filterState.orderBy,
      filterState.order,
      true,
      true
    );
  };

  const onClearFilters = () => {
    setFilterState({
      ...filterState,
      text: '',
      type: '',
      page: 1,
      limit: '',
      orderBy: '',
      order: '',
    });
    getProjects('', '', '', 1, '', '', '', true, true);
  };

  const handleFilterSearch = (newFilters: any, state: boolean) => {
    setFilterState(newFilters);
    getProjects(
      '',
      newFilters.text,
      newFilters.type,
      1,
      newFilters.limit,
      newFilters.orderBy,
      newFilters.order,
      state,
      true
    );
  };

  const onCloseModalForm = () => {
    setIsStateModal(false);
  };

  const handleCloseModal = () => {
    setIsOpenModal(false);
  };

  const onClickAddResourceTypeProject = (type: string) => {
    setDataModalResourceStateTypeProject({
      type: type,
      buttonSubmit: 'Registrar',
      row: null,
      title: 'Nuevo tipo de Proyecto',
      onCloseModalForm: onCloseModalForm,
    });
    setIsOpenTypeProjectModal(true);
    setIsStateModal(true);
  };

  const onClickAddResource = (type: string) => {
    setDataModalResourceState({
      type: type,
      buttonSubmit: 'Registrar',
      row: null,
      title: 'Nueva Proyecto',
      onCloseModalForm: onCloseModalForm,
    });
    setIsOpenModal(true);
    setIsStateModal(true);
  };

  const onClickEditResource = (row: any) => {
    setDataModalResourceState({
      type: 'edit',
      buttonSubmit: 'Actualizar',
      row: row,
      title: 'Editar Proyecto',
      onCloseModalForm: onCloseModalForm,
    });
    setIsOpenModal(true);
    setIsStateModal(true);
  };

  useEffect(() => {
    // Obtener TypeProjects al montar
    import('../../../services/type-projects.service').then(({ getTypeProjects }) => {
      getTypeProjects('', '', 1, '', '', '').then((res: any) => {
        setTypeProjects(res?.data || []);
      });
    });
    // Cargar proyectos si hay tipo seleccionado
    if (selectedTypeProject) {
      getProjects(
        selectedTypeProject,
        filterState.text,
        '',
        filterState.page,
        filterState.limit,
        filterState.orderBy,
        filterState.order,
        true,
        true
      );
    }
  }, [selectedTypeProject]);

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="card">
          <PageHeaderComponent
            state={state}
            onModalResource={() => onClickAddResource('store')}
          />
          {/* Renderizar TypeProjects como recuadros/chips arriba del botón Nuevo */}
          <div style={{ display: 'flex', gap: '8px', margin: '10px 25px' }}>
            {/* Recuadro para crear nuevo type Project */}
            <div onClick={() => onClickAddResourceTypeProject('store')} >
              <span className="btn btn-primary">+ Nuevo</span>
            </div>

            {/* Recuadros de typeProjects */}
            {typeProjects.map((tl: any) => (
              <div
                key={tl.id || tl.id}
                onClick={() => {
                  setSelectedTypeProject(tl.id || tl.id);
                }}
                className="btn btn-secondary ms-2"
              >
                {tl.name}
              </div>
            ))}
          </div>
          <div className="card-body pt-1">
            {/* Solo muestra la tabla si hay tipo seleccionado */}
            {selectedTypeProject ? (
              <PageBodyComponent
                tableCss="table-resource"
                state={state}
                onClickButtonPersonalizado={onClickButtonPersonalizado}
                onChangeEdit={onClickEditResource}
                onChangeDelete={onDelete}
                onChangePage={onChangePage}
              />
            ) : (
              <div>Selecciona un tipo de proyecto para ver la lista.</div>
            )}
          </div>
        </div>
      </div>
      {isOpenModal && (
        <ModalComponent
          stateModal={isStateModal}
          typeModal={'static'}
          onClose={handleCloseModal}
          title={dataModalResourceState.title || ''}
          size="modal-md"
          content={
            <ProjectFormComponent
              data={{ ...dataModalResourceState, type_Project_id: selectedTypeProject }}
              storeProject={(name: string, image: string) => storeProject(selectedTypeProject, name, image)}
              updateProject={updateProject}
            />
          }
        />
      )}
      {/* Modal para crear nuevo type Project */}
      {isOpenTypeProjectModal && (
        <ModalComponent
          stateModal={isStateModal}
          typeModal={'static'}
          onClose={handleCloseModal}
          title={dataModalResourceStateTypeProject.title || ''}
          size="modal-md"
          content={
            <TypeProjectFormComponent
              data={dataModalResourceStateTypeProject}
              storeTypeProject={storeTypeProject}
              updateTypeProject={updateTypeProject}
              onRefresh={onRefresh}
            />
          }
        />
      )}
    </div>
  );
};

export default ProjectsPage;
