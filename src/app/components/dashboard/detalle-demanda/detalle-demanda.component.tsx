import React, { useEffect, useRef, useState } from 'react';
import { OverlayTrigger, Popover, Table } from 'react-bootstrap';
import 'react-datetime/css/react-datetime.css';
import 'moment/locale/es';
import api from '../../../lib/axios.rxjs';
import { first } from 'rxjs';
import { IEmpleadoDemanda } from '../../../interfaces/IEmpleadoDemanda';
import { useHistory, useLocation } from 'react-router-dom';
import './gestion-demanda-detalle.scss';
import { IDetalleEmpleado } from '../../../interfaces/IDetalleEmpleado.interface';
import moment from 'moment';
import {
  AiOutlineCaretRight,
  AiOutlineInfoCircle,
  AiOutlineProfile,
} from 'react-icons/ai';
import { AxiosError } from 'axios';

const DetalleGestionDemanda = () => {
  const location = useLocation<{
    fromGestionDemanda: boolean;
    date: string;
    empleado: IEmpleadoDemanda;
    dateArray: boolean[];
  }>();
  const history = useHistory();

  const [detallesEmpleado, setDetallesEmpleados] = useState<IDetalleEmpleado[]>(
    [],
  );
  const [expanded, setExpanded] = useState<Map<number, boolean>>();

  const intervalos = useRef('');

  useEffect(() => {
    if (
      location.state === undefined ||
      location.state.empleado === undefined ||
      location.state.fromGestionDemanda === false
    ) {
      history.push('/');
    } else {
      const year = parseInt(location.state.date.split('-')[1]);
      const month = parseInt(location.state.date.split('-')[0]);
      const subs = api
        .post<any[]>(`/gestion-demanda/get-demanda-detalle`, {
          cod_empleado: location.state.empleado.cod_empleado,
          year,
          month,
          daysList: location.state.dateArray,
        })
        .pipe(first())
        .subscribe({
          next: (result) => {
            const expandTempMap = new Map<number, boolean>();
            result.data.forEach((r, i) => {
              expandTempMap.set(i, false);
            });
            setExpanded(expandTempMap);
            setDetallesEmpleados(result.data);
          },
          error: (err: AxiosError<{ error: string }>) => {
            alert(err.response?.data.error);
            setDetallesEmpleados([]);
          },
        });
      let foundStart = false;
      let dateInfoString = '';
      for (let index = 0; index < location.state.dateArray.length; index++) {
        if (location.state.dateArray[index]) {
          if (!foundStart) {
            dateInfoString += `; DESDE: ${index + 1}-${location.state.date}`;
            foundStart = true;
          }
          if (!location.state.dateArray[index + 1]) {
            dateInfoString += `, HASTA: ${index + 1}-${location.state.date}`;
            foundStart = false;
          }
        }
      }
      dateInfoString = dateInfoString.substring(2);
      intervalos.current = dateInfoString;
      return function clean() {
        subs.unsubscribe();
      };
    }
  }, [history, location.state]);

  return (
    <main className="detalle-demanda">
      <h1>
        <AiOutlineProfile style={{ fontSize: '44px' }}></AiOutlineProfile>
        DETALLE DEMANDA
      </h1>
      <section>
        {detallesEmpleado.length === 0 ? (
          <h4>Cargando Tabla...</h4>
        ) : (
          <React.Fragment>
            <h2>{location.state.empleado.nombres}</h2>
            <div className="intervalos">
              <h5>{intervalos.current}</h5>
            </div>
            <Table responsive bordered>
              <thead>
                <tr className="heads">
                  <th></th>
                  <th>
                    <h5>Perfil</h5>
                  </th>
                  {location.state.dateArray.map((day, i) => {
                    if (day) {
                      return (
                        <th key={i}>
                          <h5>{`${i + 1}-${location.state.date}`}</h5>
                        </th>
                      );
                    }
                    return null;
                  })}
                </tr>
              </thead>
              <tbody>
                {detallesEmpleado.map((de, i) => {
                  let mayorProcesoNumber = 0;
                  return (
                    <React.Fragment key={i}>
                      <tr style={{ backgroundColor: 'whitesmoke' }}>
                        <td
                          onClick={() => {
                            const temporalNewMap = new Map<number, boolean>();
                            expanded?.forEach((exp, y) => {
                              if (y === i) {
                                temporalNewMap.set(y, !exp);
                              } else {
                                temporalNewMap.set(y, exp);
                              }
                            });
                            setExpanded(temporalNewMap);
                          }}
                          style={{
                            width: '50px',
                            cursor: 'pointer',
                            textAlign: 'center',
                          }}
                        >
                          <AiOutlineCaretRight
                            style={{ fontSize: '20px' }}
                          ></AiOutlineCaretRight>
                        </td>
                        <td>{de.perfil}</td>
                        {location.state.dateArray.map((day, y) => {
                          if (day) {
                            const currentDate = moment({
                              year: parseInt(location.state.date.split('-')[1]),
                              month:
                                parseInt(location.state.date.split('-')[0]) - 1,
                              day: y + 1,
                            });
                            const currentISODate = currentDate.toISOString();
                            const indexOfDay = de.days.findIndex((d) => {
                              return d.fecha === currentISODate;
                            });
                            if (indexOfDay === -1) {
                              return (
                                <td
                                  style={{ backgroundColor: 'green' }}
                                  key={y}
                                >
                                  <h5></h5>
                                </td>
                              );
                            }
                            return (
                              <td key={y}>
                                <h5>{`${de.days[indexOfDay].total_horas} horas`}</h5>
                              </td>
                            );
                          }
                        })}
                      </tr>
                      {de.days.forEach((d) => {
                        if (d.procesos.length >= mayorProcesoNumber) {
                          mayorProcesoNumber = d.procesos.length;
                        }
                      })}
                      {Array(mayorProcesoNumber)
                        .fill('x')
                        .map((x, k) => {
                          return (
                            <tr
                              className={
                                expanded?.get(i) === true
                                  ? 'expanded'
                                  : 'closed'
                              }
                              key={k}
                            >
                              <td></td>
                              <td></td>
                              {location.state.dateArray.map((day, y) => {
                                if (day) {
                                  const currentDate = moment({
                                    year: parseInt(
                                      location.state.date.split('-')[1],
                                    ),
                                    month:
                                      parseInt(
                                        location.state.date.split('-')[0],
                                      ) - 1,
                                    day: y + 1,
                                  });
                                  const currentISODate =
                                    currentDate.toISOString();
                                  const indexOfDay = de.days.findIndex((d) => {
                                    return d.fecha === currentISODate;
                                  });
                                  if (
                                    indexOfDay === -1 ||
                                    de.days[indexOfDay].procesos[k] ===
                                      undefined
                                  ) {
                                    return (
                                      <td
                                        style={{ backgroundColor: 'green' }}
                                        key={y}
                                      >
                                        <h5></h5>
                                      </td>
                                    );
                                  }
                                  return (
                                    <OverlayTrigger
                                      rootClose
                                      placement={'top'}
                                      trigger="click"
                                      overlay={
                                        <Popover>
                                          <Popover.Header as="h3">
                                            <AiOutlineInfoCircle></AiOutlineInfoCircle>{' '}
                                            {`PROCESO ${de.days[indexOfDay].procesos[k].proceso_id}`}
                                          </Popover.Header>
                                          <Popover.Body>
                                            <h6>
                                              Cliente:{' '}
                                              <span>
                                                {
                                                  de.days[indexOfDay].procesos[
                                                    k
                                                  ].cliente
                                                }
                                              </span>
                                            </h6>
                                            <h6>
                                              Sub-cliente:{' '}
                                              <span>
                                                {
                                                  de.days[indexOfDay].procesos[
                                                    k
                                                  ].sub_cliente
                                                }
                                              </span>
                                            </h6>
                                            <h6>
                                              Solicitante:{' '}
                                              <span>
                                                {
                                                  de.days[indexOfDay].procesos[
                                                    k
                                                  ].solicitante
                                                }
                                              </span>
                                            </h6>
                                            <h6>
                                              Proyecto:{' '}
                                              <span>
                                                {de.days[indexOfDay].procesos[k]
                                                  .proyecto || 'Desconocido'}
                                              </span>
                                            </h6>
                                            <h6>
                                              Horas:{' '}
                                              <span>
                                                {
                                                  de.days[indexOfDay].procesos[
                                                    k
                                                  ].horas
                                                }
                                              </span>
                                            </h6>
                                          </Popover.Body>
                                        </Popover>
                                      }
                                    >
                                      <td
                                        className="internal-container"
                                        key={y}
                                      >
                                        <h5 className="internal">
                                          {`PROCESO ${de.days[indexOfDay].procesos[k].proceso_id}`}
                                        </h5>
                                      </td>
                                    </OverlayTrigger>
                                  );
                                }
                              })}
                            </tr>
                          );
                        })}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </Table>
          </React.Fragment>
        )}
      </section>
    </main>
  );
};

export default DetalleGestionDemanda;
