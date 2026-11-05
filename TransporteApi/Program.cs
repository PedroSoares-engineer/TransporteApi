using Microsoft.EntityFrameworkCore;
using TransporteApi.Data;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// 1. Configuração de CORS (Permite requisições do React)
builder.Services.AddCors(options =>
{
    options.AddPolicy("PermitirTudo", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

builder.Services.AddControllers();

var chave = Encoding.ASCII.GetBytes("ChaveMestraSeguraTransporteInteligente2026!");
builder.Services.AddAuthentication(x =>
{
    x.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    x.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(x =>
{
    x.RequireHttpsMetadata = false;
    x.SaveToken = true;
    x.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(chave),
        ValidateIssuer = false,
        ValidateAudience = false
    };
});

// 2. Configura o EF Core com banco em memória
builder.Services.AddDbContext<TransporteContext>(options =>
    options.UseSqlite("Data Source=transporte.db"));

var app = builder.Build();
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<TransporteApi.Data.TransporteContext>();

    // Cria o arquivo transporte.db fisicamente na pasta do projeto
    db.Database.EnsureCreated();

    // Verifica se a tabela está vazia. Se estiver, cria o Pedro e o Administrador
    if (!db.Usuarios.Any())
    {
        db.Usuarios.AddRange(
            new TransporteApi.Models.Usuario
            {
                Nome = "Pedro Soares (Proprietário)",
                Email = "991863784pedro@gmail.com",
                SenhaHash = BCrypt.Net.BCrypt.HashPassword("Pedro1506"),
                Regra = "Proprietario"
            },
            new TransporteApi.Models.Usuario
            {
                Nome = "Administrador Geral",
                Email = "admin@transporte.com",
                SenhaHash = BCrypt.Net.BCrypt.HashPassword("TransporteAPI"),
                Regra = "Admin"
            }
        );
        db.SaveChanges();
    }
}

// Ativa a política de CORS
app.UseCors("PermitirTudo");

app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
