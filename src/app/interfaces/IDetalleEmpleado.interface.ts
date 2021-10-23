export interface IDetalleEmpleado {
  perfil: string;
  days: [
    {
      fecha: Date | string;
      total_horas: number;
      procesos: Proceso[];
    },
  ];
}

interface Proceso {
  horas: number;
  proceso_id: string;
  cliente: string;
  solicitante: string;
  proyecto: string;
  sub_cliente: string;
}
