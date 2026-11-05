using Microsoft.EntityFrameworkCore;
using TransporteApi.Models;

namespace TransporteApi.Data;

public class TransporteContext : DbContext
{
    public TransporteContext(DbContextOptions<TransporteContext> options) : base(options)
    {
    }

    public DbSet<LinhaOnibus> LinhasOnibus { get; set; }
    public DbSet<Usuario> Usuarios { get; set; }
    public DbSet<Ocorrencia> Ocorrencias { get; set; }
}
