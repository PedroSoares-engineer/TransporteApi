namespace TransporteApi.Models
{
    public class LinhaOnibus
    {
        public int Id { get; set; }
        public string Nome { get; set; } = string.Empty;
        public string Codigo { get; set; } = string.Empty;
        public string Status { get; set; } = "No horário";
        public string ProximaPartida { get; set; } = string.Empty;
        public int Lotacao { get; set; } = 50;

        // Novos campos para Cidade e Estado da Linha
        public string Cidade { get; set; } = string.Empty;
        public string Estado { get; set; } = string.Empty;
    }
}
