export interface IDisponibilidad {
  desde: Date | string;
  hasta: Date | string;
  estado: string;
  resultado: string;
  fechas: { fecha: Date | string; horas: number }[];
}
