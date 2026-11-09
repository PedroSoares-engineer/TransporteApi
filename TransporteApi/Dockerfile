# Fase de Construção (Build)
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /app

# Copia os ficheiros do projeto e compila
COPY . ./
RUN dotnet restore
RUN dotnet publish -c Release -o out

# Fase de Execução (Runtime)
FROM mcr.microsoft.com/dotnet/aspnet:10.0
WORKDIR /app
COPY --from=build /app/out .

# Expõe a porta que a Render vai usar
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080

# ATENÇÃO: Substitui "TransporteApi.dll" pelo nome exato do teu ficheiro C#
ENTRYPOINT ["dotnet", "TransporteApi.dll"]
