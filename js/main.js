function buscarCidade() {
  const busca = document.getElementById("busca").value.toLowerCase();
  fetch("data/providers.json")
    .then(res => res.json())
    .then(data => {
      const resultadoDiv = document.getElementById("resultado");
      resultadoDiv.innerHTML = "";
      if (data[busca]) {
        const link = document.createElement("a");
        link.href = data[busca].link;
        link.target = "_blank";
        link.innerText = "Acesse o site do provedor em " + busca.toUpperCase();
        resultadoDiv.appendChild(link);
      } else {
        resultadoDiv.innerHTML = "Nenhum provedor encontrado para esta cidade ou CEP.";
      }
    });
}