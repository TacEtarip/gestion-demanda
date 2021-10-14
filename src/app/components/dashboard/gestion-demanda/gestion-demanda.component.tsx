import React, { useEffect, useState } from 'react';
import { Col, OverlayTrigger, Popover, Row, Table } from 'react-bootstrap';
import Form from 'react-bootstrap/esm/Form';
import './gestion-demanda.style.scss';
import Datetime from 'react-datetime';
import 'react-datetime/css/react-datetime.css';
import 'moment/locale/es';
import { Moment } from 'moment';
import api from '../../../lib/axios.rxjs';
import { first } from 'rxjs';
import { IEmpleadoDemanda } from '../../../interfaces/IEmpleadoDemanda';

const GestionDemanda = () => {
  const [daysOfMonth, setDaysOfMonth] = useState(0);
  const [listaEmpleados, setListaEmpleados] = useState<IEmpleadoDemanda[]>([]);

  const updateMonth = (current: string | Moment) => {
    const parsedCurrent = current as Moment;
    if (typeof current === 'string') {
      setDaysOfMonth(0);
    } else {
      setDaysOfMonth(parsedCurrent.daysInMonth());
    }
  };

  useEffect(() => {
    const subs = api
      .get<IEmpleadoDemanda[]>('gestion-demanda/get-demandas/10/2021/0')
      .pipe(first())
      .subscribe({
        next: (r) => setListaEmpleados(r),
      });
    return function clean() {
      subs.unsubscribe();
    };
  }, []);

  const popover = (
    <Popover id="popover-basic">
      <Popover.Header as="h3">100%</Popover.Header>
      <Popover.Body>
        And here some <strong>amazing</strong> content. It very engaging. right?
      </Popover.Body>
    </Popover>
  );

  /**
   *
   *
   * @param {Moment} current
   * @return {boolean}
   */
  function valid(current: Moment): boolean {
    const today = new Date();
    return (
      current.year() < today.getFullYear() ||
      (current.year() === today.getFullYear() &&
        current.month() < today.getMonth() + 1)
    );
  }

  return (
    <main>
      <h1>PROGRAMACIÓN</h1>
      <Form>
        <Row className="g-3">
          <Form.Group as={Col} md={6}>
            <Form.Label>Empleado</Form.Label>
            <Form.Select size="lg" aria-label="Default select example">
              <option>Seleccionar empleado</option>
              <option value={-1}>Todos</option>
              {listaEmpleados.map((e, i) => {
                return (
                  <option key={i} value={i}>
                    {e.apellido_paterno}
                  </option>
                );
              })}
            </Form.Select>
          </Form.Group>
          <Form.Group as={Col} md={6}>
            <Form.Label>Mes - Año</Form.Label>
            <Datetime
              dateFormat="MM-YYYY"
              inputProps={{ placeholder: 'Seleccionar mes - año' }}
              timeFormat={false}
              isValidDate={valid}
              locale="es"
              onChange={updateMonth}
            />
          </Form.Group>
        </Row>
      </Form>
      <section>
        {daysOfMonth === 0 ? (
          <h4>Selecciona un mes y un empleado</h4>
        ) : (
          <Table responsive striped bordered hover>
            <thead>
              <tr>
                <th>Nombre</th>
                {[...Array(daysOfMonth)].map((d, i) => {
                  return (
                    <th key={i}>
                      {(i + 1).toString().length === 1 ? '0' + (i + 1) : i + 1}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Pesona 1</td>
                {[...Array(daysOfMonth)].map((d, i) => {
                  return (
                    <OverlayTrigger key={i} placement="right" overlay={popover}>
                      <td
                        style={
                          i < 10
                            ? { backgroundColor: 'red' }
                            : { backgroundColor: 'yellow' }
                        }
                      ></td>
                    </OverlayTrigger>
                  );
                })}
              </tr>
              <tr>
                <td>Pesona 2</td>
                {[...Array(daysOfMonth)].map((d, i) => {
                  return <td key={i}></td>;
                })}
              </tr>
            </tbody>
          </Table>
        )}
      </section>
    </main>
  );
};

export default GestionDemanda;
