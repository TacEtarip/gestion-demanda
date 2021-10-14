export interface IEmpleadoDemanda {
  cod_empleado: number;
  apellido_paterno: string;
  apellido_materno: string;
  nombres: string;
  mes: number;
  anio: number;
  demandas: {
    fecha: string;
    valor: number;
    cantidad_horas: number;
    porcentaje_dedicacion: number;
  }[];
}
