import React, { useEffect, useState, useMemo, useRef } from 'react';
import { Form, Col, Row, Spinner, Button } from 'react-bootstrap';
import { AiOutlineInfoCircle, AiOutlineSchedule } from 'react-icons/ai';
import {
  concatMap,
  delay,
  retryWhen,
  Subscription,
  take,
  throwError,
} from 'rxjs';
import { ICargo } from '../../../interfaces/ICargo';
import { ICliente } from '../../../interfaces/ICliente.interface';
import { IDisponibilidad } from '../../../interfaces/IDisponibilidad';
import { IProceso } from '../../../interfaces/IProceso';
import api from '../../../lib/axios.rxjs';
import './programacion-demanda.scss';
import 'moment/locale/es';
import { AxiosError } from 'axios';

const d = new Date();
const year = d.getFullYear();
const mes = d.getMonth();
const dia = d.getDate();

const ProgramacionDemanda = () => {
  const toScroll = useRef<any>(null);

  const [clientes, setClientes] = useState<ICliente[]>([]);
  const [procesos, setProcesos] = useState<IProceso[]>([]);

  const [codCliente, setCodCliente] = useState(-1);
  const [codProceso, setCodProceso] = useState(-1);

  const [manual, setManual] = useState(false);

  const [cargando, setCargando] = useState(false);

  const [fecha, setFecha] = useState(new Date());

  const [horas, setHoras] = useState('1');

  const [cargo, setCargo] = useState<Partial<ICargo>>({
    cod_cargo: -20,
  });

  const [disponibilidad, setDisponibilidad] = useState<
    Partial<IDisponibilidad>
  >({ estado: '3' });

  const programar = () => {
    setCargando(true);
    setDisponibilidad({ estado: '2' });
    if (manual === false) {
      api
        .post<IDisponibilidad>(`gestion-demanda/programar/automatico`, {
          fecha,
          cod_empleado: cargo.cod_empleado,
          cod_cargo: cargo.cod_cargo,
          cod_proceso: codProceso,
        })
        .pipe(
          retryWhen((errors) =>
            errors.pipe(delay(1000), take(10), concatMap(throwError)),
          ),
          take(10),
        )
        .subscribe({
          next: (result) => {
            setCargando(false);
            toScroll.current?.scrollIntoView();
            setDisponibilidad(result.data as IDisponibilidad);
          },
          error: (err: AxiosError<{ error: string }>) => {
            alert(err.response?.data.error);
            setCargando(false);
            setDisponibilidad({ estado: '3' });
          },
        });
    } else {
      api
        .post<Partial<IDisponibilidad>>(`gestion-demanda/programar/manual`, {
          cod_empleado: cargo.cod_empleado,
          cod_cargo: cargo.cod_cargo,
          cod_proceso: codProceso,
          fecha,
          dias: cargo.dias,
          cantidad_horas: parseInt(horas),
        })
        .pipe(
          retryWhen((errors) =>
            errors.pipe(delay(1000), take(10), concatMap(throwError)),
          ),
          take(10),
        )
        .subscribe({
          next: (result) => {
            setCargando(false);
            toScroll.current?.scrollIntoView();
            setDisponibilidad(result.data as IDisponibilidad);
          },
          error: (err: AxiosError<{ error: string }>) => {
            alert(err.response?.data.error);
            setCargando(false);
            setDisponibilidad({ estado: '3' });
          },
        });
    }
  };

  useEffect(() => {
    let subs: Subscription;
    if (codProceso === -1) {
      setCargo({ cod_cargo: -20 });
    } else {
      setCargando(true);
      subs = api
        .get<ICargo>(`gestion-demanda/proceso/${codProceso}`)
        .pipe(
          retryWhen((errors) =>
            errors.pipe(delay(1000), take(10), concatMap(throwError)),
          ),
        )
        .subscribe({
          next: (result) => {
            setCargando(false);
            setCargo(result.data);
          },
          error: (err: AxiosError<{ error: string }>) => {
            alert(err.response?.data.error);
            setCargando(false);
            setCargo({ cod_cargo: -20 });
          },
        });
    }
    return () => {
      if (subs) {
        subs.unsubscribe();
      }
    };
  }, [codProceso]);

  useEffect(() => {
    setCodCliente(-1);
  }, [clientes]);

  const fechaValida = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0);
    if (fecha < today) {
      if (fecha.toLocaleDateString() === today.toLocaleDateString()) {
        return true;
      }
      return false;
    }
    return true;
  }, [fecha]);

  const horasValidas = useMemo(() => {
    const nuevaHoras = parseInt(horas);
    if (isNaN(nuevaHoras)) {
      return false;
    }
    if (nuevaHoras > 8 || nuevaHoras < 1) {
      return false;
    }
    return true;
  }, [horas]);

  useEffect(() => {
    let subs: Subscription;
    setProcesos([]);
    setCodProceso(-1);
    setCargando(true);
    if (codCliente === -1) {
      setProcesos([]);
      setCargando(false);
    } else {
      subs = api
        .get<IProceso[]>(`gestion-demanda/clientes/${codCliente}/procesos`)
        .pipe(
          retryWhen((errors) =>
            errors.pipe(delay(1000), take(10), concatMap(throwError)),
          ),
        )
        .subscribe({
          next: (result) => {
            setCargando(false);
            setProcesos(result.data);
          },
          error: (err: AxiosError<{ error: string }>) => {
            alert(err.response?.data.error);
            setCargando(false);
            setProcesos([]);
          },
        });
    }
    return () => {
      if (subs) {
        subs.unsubscribe();
      }
    };
  }, [codCliente]);

  useEffect(() => {
    setCargando(true);
    const subs = api
      .get<ICliente[]>('gestion-demanda/clientes')
      .pipe(
        retryWhen((errors) =>
          errors.pipe(delay(1000), take(10), concatMap(throwError)),
        ),
      )
      .subscribe({
        next: (result) => {
          setCargando(false);
          setClientes(result.data);
        },
        error: (err: AxiosError<{ error: string }>) => {
          alert(err.response?.data.error);
          setCargando(false);
          setClientes([]);
        },
      });
    return () => {
      subs.unsubscribe();
    };
  }, []);

  return (
    <main>
      <h1>
        <AiOutlineSchedule style={{ fontSize: '44px' }}></AiOutlineSchedule>
        PROGRAMAR
      </h1>
      {clientes.length === 0 ? (
        <div>
          <h2>Cargando...</h2>
        </div>
      ) : (
        <Form
          onSubmit={(e) => {
            e.preventDefault();
            programar();
          }}
        >
          <Row className="g-3">
            <Form.Group as={Col} md={12}>
              <Form.Check
                type="checkbox"
                label="Habilitar Programación Manual (No Recomendado)."
                onChange={(e) => {
                  setDisponibilidad({ estado: '3' });
                  setManual(e.target.checked);
                }}
              />
            </Form.Group>
            <Form.Group as={Col} md={6}>
              <Form.Label>Cliente</Form.Label>
              <Form.Select
                disabled={cargando}
                onChange={(e) =>
                  setCodCliente(parseInt((e.target as HTMLInputElement).value))
                }
                value={codCliente}
                size="lg"
              >
                <option value={-1}>Seleccionar Cliente</option>
                {clientes.map((cliente, index) => {
                  return (
                    <option key={index} value={cliente.cod_cliente}>
                      {cliente.cliente}
                    </option>
                  );
                })}
              </Form.Select>
            </Form.Group>
            <Form.Group as={Col} md={6}>
              <Form.Label>Proceso</Form.Label>
              <Form.Select
                onChange={(e) =>
                  setCodProceso(parseInt((e.target as HTMLInputElement).value))
                }
                value={codProceso}
                disabled={codCliente === -1 || cargando}
                size="lg"
              >
                <option value={-1}>Seleccionar Proceso...</option>
                {procesos.map((proceso, index) => {
                  return (
                    <option key={index} value={proceso.cod_proceso}>
                      {proceso.proceso}
                    </option>
                  );
                })}
              </Form.Select>
            </Form.Group>
            <Form.Group as={Col} md={6}>
              <Form.Label>Cargo</Form.Label>
              <Form.Control
                size="lg"
                type="text"
                placeholder="Cargo..."
                value={cargo.cod_cargo === -20 ? '' : cargo.cargo}
                readOnly
              />
            </Form.Group>
            <Form.Group as={Col} md={6}>
              <Form.Label>Empleado Responsable</Form.Label>
              <Form.Control
                size="lg"
                type="text"
                placeholder="Empleado Responsable..."
                value={cargo.cod_cargo === -20 ? '' : cargo.empleado}
                readOnly
              />
            </Form.Group>
            <Form.Group as={Col} md={!manual ? 4 : 6}>
              <Form.Label>Dias Requeridos</Form.Label>
              <Form.Control
                size="lg"
                type="text"
                placeholder="Dias Dedicados..."
                value={cargo.cod_cargo === -20 ? '' : cargo.dias}
                readOnly
              />
            </Form.Group>
            <Form.Group as={Col} md={!manual ? 4 : 6}>
              <Form.Label>Horas Dedicadas</Form.Label>
              <Form.Control
                size="lg"
                type="text"
                placeholder="Horas Dedicadas..."
                value={cargo.cod_cargo === -20 ? '' : cargo.horas}
                readOnly
              />
            </Form.Group>
            <Form.Group as={Col} md={!manual ? 4 : 6}>
              <Form.Label>{!manual ? 'Desde' : 'Día'}</Form.Label>
              <Form.Control
                size="lg"
                autoComplete="off"
                type="date"
                isInvalid={!fechaValida}
                onChange={(e) => {
                  let fechaNueva: Date;
                  if (!e.target.value) {
                    fechaNueva = new Date();
                  } else {
                    fechaNueva = new Date(
                      parseInt(e.target.value.split('-')[0]),
                      parseInt(e.target.value.split('-')[1]) - 1,
                      parseInt(e.target.value.split('-')[2]),
                    );
                  }
                  setFecha(fechaNueva);
                }}
                value={
                  fecha.toLocaleDateString().split('/')[2] +
                  '-' +
                  fecha.toLocaleDateString().split('/')[1] +
                  '-' +
                  fecha.toLocaleDateString().split('/')[0]
                }
                min={`${year.toString()}-${
                  (mes + 1).toString().length === 1
                    ? '0' + (mes + 1).toString()
                    : (mes + 1).toString()
                }-${
                  dia.toString().length === 1
                    ? '0' + dia.toString()
                    : dia.toString()
                }`}
              />
            </Form.Group>
            {manual ? (
              <Form.Group as={Col} md={6}>
                <Form.Label>Horas</Form.Label>
                <Form.Control
                  isInvalid={!horasValidas}
                  size="lg"
                  type="number"
                  placeholder="Numero de horas..."
                  value={horas}
                  onChange={(e) => setHoras(e.target.value)}
                />
                <Form.Control.Feedback type="invalid">
                  Minimo 1 hora, maximo 8 horas.
                </Form.Control.Feedback>
              </Form.Group>
            ) : null}
          </Row>
          <Col md={12}>
            <Button
              disabled={
                cargando ||
                cargo.cod_cargo === -20 ||
                !fechaValida ||
                (manual && !horasValidas)
              }
              style={{ width: '100%', marginTop: '25px' }}
              variant="secondary"
              type="submit"
            >
              Programar
            </Button>
          </Col>
        </Form>
      )}
      {disponibilidad.estado == '3' ? null : (
        <section ref={toScroll} className="result">
          {disponibilidad.estado == '2' ? (
            <Spinner animation="grow" variant="secondary" role="status">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
          ) : disponibilidad.estado == '1' ? (
            <div>
              <h2>{disponibilidad.resultado}</h2>
            </div>
          ) : (
            <div>
              <h2>
                <AiOutlineInfoCircle></AiOutlineInfoCircle> SE REALIZO LA
                PROGRAMACIÓN CORRECTAMENTE
              </h2>
              {!manual ? (
                <React.Fragment>
                  <h4>
                    DESDE: <span>{fecha.toLocaleDateString()}</span>, HASTA:{' '}
                    <span>
                      {new Date(
                        disponibilidad.hasta || '',
                      ).toLocaleDateString() || 'No Asignado'}
                    </span>
                  </h4>
                  <h3>DÍAS - HORAS</h3>
                  <div className="fechas">
                    {disponibilidad.fechas?.map((fecha, index) => {
                      const day = new Date(fecha.fecha);
                      return (
                        <div key={index} className="square">
                          <h6>
                            <span>{`${day.toLocaleDateString()}`}</span>{' '}
                            {`(${day.toLocaleDateString('es-PE', {
                              weekday: 'long',
                            })})`}
                          </h6>
                          <h6 className="horas">{`${fecha.horas}h`}</h6>
                        </div>
                      );
                    })}
                  </div>
                </React.Fragment>
              ) : (
                <React.Fragment>
                  <h3>{`DÍA: ${fecha.toLocaleDateString()}, HORAS: ${horas}`}</h3>
                </React.Fragment>
              )}
            </div>
          )}
        </section>
      )}
    </main>
  );
};

export default ProgramacionDemanda;
