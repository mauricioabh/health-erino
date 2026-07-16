export type Medicamento = {
  id: string;
  nombre: string;
  descripcion: string | null;
  fecha_caducidad: string | null;
  stock: number;
  user_id: string;
  created_at?: string;
};

export type MedicamentoInsert = Omit<Medicamento, "id" | "created_at"> & {
  id?: string;
};
