import React, { useEffect, useState, useRef } from 'react';
import { Col, InputGroup, Row, Table } from 'react-bootstrap';
import Form from 'react-bootstrap/esm/Form';
import './gestion-demanda.style.scss';
import Datetime from 'react-datetime';
import 'react-datetime/css/react-datetime.css';
import 'moment/locale/es';
import moment, { Moment } from 'moment';
import api from '../../../lib/axios.rxjs';
import { useContextMenu } from '../../context-menu/context-menu.component';
import { first } from 'rxjs';
import { IEmpleadoDemanda } from '../../../interfaces/IEmpleadoDemanda';
import { Link } from 'react-router-dom';
import { AiFillCalendar, AiOutlineProfile } from 'react-icons/ai';
import { AxiosError } from 'axios';

const GestionDemanda = () => {
  const onActual = useRef(-1);
  const selecting = useRef(false);

  const tableRef = useRef<HTMLDivElement>(null);

  const { visible, anchorPoint } = useContextMenu(tableRef.current);

  const [fecha, setFecha] = useState(
    moment(Date.now()).utc().format('MM-YYYY'),
  );
  const [monthDays, setMonthDays] = useState<{ number: number; day: string }[]>(
    [],
  );
  const [listaEmpleados, setListaEmpleados] = useState<IEmpleadoDemanda[]>([]);
  const [listaEmpleadosShow, setListaEmpleadosShow] = useState<
    IEmpleadoDemanda[]
  >([]);
  const [selectedList, setSelectedList] = useState<boolean[][]>([]);
  const baseMonthRef = useRef<boolean[]>([]);
  const [onEmpleado, setOnEmpleado] = useState(-1);
  const multipleSelection = useRef(false);
  const lastSelectedPos = useRef(-1);

  useEffect(() => {
    const handleRemoteSelecting = () => {
      if (selecting.current) {
        selecting.current = false;
      }
    };
    const handleShiftDown = (e: any) => {
      if (e.shiftKey) {
        multipleSelection.current = true;
      }
    };

    const handleShiftUp = (e: KeyboardEvent) => {
      if (e.key === 'Shift') {
        multipleSelection.current = false;
      }
    };
    document.addEventListener('mouseup', handleRemoteSelecting);
    document.addEventListener('keydown', handleShiftDown);
    document.addEventListener('keyup', handleShiftUp);
    return () => {
      document.removeEventListener('mouseup', handleRemoteSelecting);
      document.removeEventListener('keydown', handleShiftDown);
      document.removeEventListener('keydown', handleShiftUp);
    };
  }, []);

  const updateMonth = (current: string | Moment) => {
    if (typeof current !== 'string') {
      setFecha(moment(current).utc().format('MM-YYYY'));
    }
  };

  const changeEmpleado = (value: string) => {
    onActual.current = -1;
    const parsedValue = parseInt(value);
    setOnEmpleado(parsedValue);
  };

  useEffect(() => {
    const temporalMD: { number: number; day: string }[] = [];
    baseMonthRef.current = [];
    const newMoment = moment({
      year: parseInt(fecha.split('-')[1]),
      month: parseInt(fecha.split('-')[0]) - 1,
    });
    for (let index = 1; index <= newMoment.daysInMonth(); index++) {
      temporalMD.push({
        number: index,
        day: moment({
          year: newMoment.year(),
          month: newMoment.month(),
          day: index,
        })
          .utc()
          .format('ddd-DD'),
      });
      baseMonthRef.current.push(false);
    }
    setMonthDays(temporalMD);
    setSelectedList([[...baseMonthRef.current]]);
    setListaEmpleados([]);
    setListaEmpleadosShow([]);
    const subs = api
      .get<IEmpleadoDemanda[]>(
        `gestion-demanda/get-demandas/${fecha.split('-')[0]}/${
          fecha.split('-')[1]
        }/0`,
      )
      .pipe(first())
      .subscribe({
        next: (result) => {
          const expandTempMap = new Map<number, boolean>();
          result.data.forEach((r, i) => {
            expandTempMap.set(i, false);
          });
          setListaEmpleados(result.data);
        },
        error: (err: AxiosError<{ error: string }>) => {
          alert(err.response?.data.error);
          setListaEmpleados([]);
        },
      });
    return function clean() {
      subs.unsubscribe();
    };
  }, [fecha]);

  useEffect(() => {
    lastSelectedPos.current = -1;
    setSelectedList([[...baseMonthRef.current]]);
    if (onEmpleado === -1) {
      for (let index = 0; index < listaEmpleados.length; index++) {
        setSelectedList((sl) => {
          const slt = [...sl];
          slt.push([...baseMonthRef.current]);
          return slt;
        });
      }
      setListaEmpleadosShow([...listaEmpleados]);
    } else {
      if (listaEmpleados[onEmpleado]) {
        setListaEmpleadosShow([listaEmpleados[onEmpleado]]);
      } else {
        setListaEmpleadosShow([]);
      }
    }
  }, [listaEmpleados, onEmpleado]);

  const selectDateOnClick = (
    empleadoIndex: number,
    dateNumber: number,
    button: number,
  ) => {
    if (button === 0) {
      selecting.current = true;
      selectDate(empleadoIndex, dateNumber);
    }
  };

  const selectDateOnMouseEnter = (
    empleadoIndex: number,
    dateNumber: number,
  ) => {
    if (selecting.current) {
      selectDate(empleadoIndex, dateNumber);
    }
  };

  const selectDate = (empleadoIndex: number, dateNumber: number) => {
    if (onActual.current === empleadoIndex) {
      if (
        multipleSelection.current === true &&
        dateNumber !== lastSelectedPos.current
      ) {
        if (dateNumber < lastSelectedPos.current) {
          for (
            let index = lastSelectedPos.current;
            index > dateNumber;
            index--
          ) {
            selectedList[onActual.current][index] = true;
          }
        } else {
          for (
            let index = lastSelectedPos.current;
            index < dateNumber;
            index++
          ) {
            selectedList[onActual.current][index] = true;
          }
        }
      }
      selectedList[onActual.current][dateNumber] =
        !selectedList[onActual.current][dateNumber];
      setSelectedList([...selectedList]);
    } else {
      selectedList[onActual.current] = [...baseMonthRef.current];
      onActual.current = empleadoIndex;
      selectedList[onActual.current][dateNumber] =
        !selectedList[onActual.current][dateNumber];
      setSelectedList([...selectedList]);
    }
    lastSelectedPos.current = dateNumber;
  };

  const stopSelection = () => {
    selecting.current = false;
  };

  return (
    <main>
      <h1>
        <AiOutlineProfile style={{ fontSize: '44px' }}></AiOutlineProfile>
        PROGRAMACIÓN
      </h1>
      <Form onSubmit={(event) => event.preventDefault()}>
        <Row className="g-3">
          <Form.Group as={Col} md={6}>
            <Form.Label>Mes - Año</Form.Label>
            <InputGroup>
              <InputGroup.Text>
                <AiFillCalendar></AiFillCalendar>
              </InputGroup.Text>
              <Datetime
                dateFormat="MM-YYYY"
                inputProps={{
                  placeholder: 'Seleccionar mes - año',
                  value: fecha,
                }}
                timeFormat={false}
                locale="es"
                onChange={updateMonth}
              />
            </InputGroup>
          </Form.Group>

          <Form.Group as={Col} md={6}>
            <Form.Label>Empleado</Form.Label>
            <Form.Select
              onChange={(e) =>
                changeEmpleado((e.target as HTMLInputElement).value)
              }
              size="lg"
            >
              <option value={-1}>Todos</option>
              {listaEmpleados.map((e, i) => {
                return (
                  <option key={i} value={i}>
                    {`${e.apellido_paterno} ${e.apellido_materno}, ${e.nombres}`}
                  </option>
                );
              })}
            </Form.Select>
          </Form.Group>
        </Row>
      </Form>
      <section ref={tableRef}>
        {listaEmpleadosShow.length === 0 ? (
          <h4>Cargando Tabla...</h4>
        ) : (
          <React.Fragment>
            <h4>{fecha}</h4>
            <div>
              <Table responsive striped bordered>
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Total Horas</th>
                    {monthDays.map((md, i) => {
                      return <th key={i}>{md.day}</th>;
                    })}
                  </tr>
                </thead>
                <tbody>
                  {listaEmpleadosShow.map((le, i) => {
                    let dIndex = 0;
                    return (
                      <tr key={i}>
                        <td>
                          <h6>{`${le.apellido_paterno} ${le.apellido_materno}, ${le.nombres}`}</h6>
                        </td>
                        <td>{`${le.horas_totales}h`}</td>
                        {monthDays.map((d, y) => {
                          if (le.demandas[dIndex]) {
                            const diaParsed = moment(le.demandas[dIndex].fecha)
                              .utc()
                              .format('D');
                            if (d.number === parseInt(diaParsed)) {
                              dIndex++;
                              return (
                                <td
                                  tabIndex={0}
                                  onMouseDown={(e) =>
                                    selectDateOnClick(i, y, e.button)
                                  }
                                  onMouseUp={() => stopSelection()}
                                  onMouseEnter={() =>
                                    selectDateOnMouseEnter(i, y)
                                  }
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      selectDate(i, y);
                                    }
                                  }}
                                  onDrag={() => (selecting.current = false)}
                                  className={
                                    le.demandas[dIndex - 1]
                                      .porcentaje_dedicacion < 100
                                      ? selectedList[i][y]
                                        ? 'square yellow-sq selected noselect'
                                        : 'square yellow-sq noselect'
                                      : selectedList[i][y]
                                      ? 'square red-sq selected noselect'
                                      : 'square red-sq noselect'
                                  }
                                  key={y}
                                >
                                  <h5 className="noselect">
                                    {`${
                                      le.demandas[dIndex - 1].cantidad_horas
                                    } horas`}
                                  </h5>
                                </td>
                              );
                            }
                          }
                          return (
                            <td key={y} style={{ backgroundColor: 'green' }}>
                              <h5></h5>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
              <ul
                className="menu"
                style={{ top: anchorPoint.y, left: anchorPoint.x }}
              >
                <li>
                  <Link
                    style={
                      visible ? { display: 'list-item' } : { display: 'none' }
                    }
                    to={{
                      state: {
                        fromGestionDemanda: true,
                        date: fecha,
                        empleado: listaEmpleadosShow[onActual.current],
                        dateArray: selectedList[onActual.current],
                      },
                      pathname: '/dashboard/gestion-demanda/detalle',
                    }}
                  >
                    Ver Detalle
                  </Link>
                </li>
              </ul>
            </div>
          </React.Fragment>
        )}
      </section>
    </main>
  );
};

export default GestionDemanda;
