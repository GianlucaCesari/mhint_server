
function redondeo(num,precision)
{
  num = num.toString().replace(/\ |\,/g,'');
  if(isNaN(num))
  num = "0";
  cents = Math.floor((num*100+0.5)%100);
  num = Math.floor((num*100+0.5)/100).toString();
  if(cents < 10)
	cents = "0" + cents;
  for (var i = 0; i < Math.floor((num.length-(1+i))/3); i++)
	num = num.substring(0,num.length-(4*i+3))+num.substring(num.length-(4*i+3));
	if (precision > 0)
	{
	  return (' ' + num + ',' + cents);
	}
	else if (precision == 0)
	{
	  return (' ' + num);
	}
}
function calcularCaloriasDiarias()
{
	/*Definimos variables*/
	var altura=document.getElementById("altura").value;
	altura=altura.toString().replace(',','.');

	var peso=document.getElementById("peso").value;
	peso=peso.toString().replace(',','.');

	var edad=document.getElementById("edad").value;
	edad=edad.toString().replace(',','.');

	var indiceSexo=document.getElementById("sexo").selectedIndex;
	var sexo=document.getElementById("sexo").options[indiceSexo].value;

	var indiceNivelActividad=document.getElementById("nivelActividad").selectedIndex;
	var nivelActividad=document.getElementById("nivelActividad").options[indiceNivelActividad].value;

    if(altura==""||peso==""||edad==""||altura<3)
	{
    	document.getElementById("errorCalorias").innerHTML="Por favor, rellene correctamente todos los campos, es decir, altura, peso y edad. Recuerde que la altura debe ser introducida en centímetros (es decir, si mide 1,7 metros, hay que poner 170).";
    }
    else
	{
    	document.getElementById("errorCalorias").innerHTML="";
		var valorNivelActividad=0;
		if(indiceNivelActividad==0)
		{
			valorNivelActividad=1.2;
		}
		else if(indiceNivelActividad==1)
		{
			valorNivelActividad=1.37;
		}
		else if(indiceNivelActividad==2)
		{
			valorNivelActividad=1.54;
		}
		else if(indiceNivelActividad==3)
		{
			valorNivelActividad=1.72;
		}
		else if(indiceNivelActividad==4)
		{
			valorNivelActividad=1.9;
		}
		if(indiceSexo==0)
		{
			var variableAuxiliar=10*peso+6.25*altura-5*edad+5;
			var caloriasMantenerPeso=valorNivelActividad*variableAuxiliar;
			document.getElementById("resultado1").value=Math.round(caloriasMantenerPeso*1000)/1000;
			var calorias1menos=caloriasMantenerPeso-500;
			document.getElementById("resultado2").value=Math.round(calorias1menos*1000)/1000;
			var calorias2menos=caloriasMantenerPeso-1000;
			document.getElementById("resultado3").value=Math.round(calorias2menos*1000)/1000;
			var calorias1mas=caloriasMantenerPeso+500;
			document.getElementById("resultado4").value=Math.round(calorias1mas*1000)/1000;
			var calorias2mas=caloriasMantenerPeso+1000;
			document.getElementById("resultado5").value=Math.round(calorias2mas*1000)/1000;
		}
		else
		{
			var variableAuxiliar=10*peso+6.25*altura-5*edad-161;
			var caloriasMantenerPeso=valorNivelActividad*variableAuxiliar;
			document.getElementById("resultado1").value=Math.round(caloriasMantenerPeso*1000)/1000;
			var calorias1menos=caloriasMantenerPeso-500;
			document.getElementById("resultado2").value=Math.round(calorias1menos*1000)/1000;
			var calorias2menos=caloriasMantenerPeso-1000;
			document.getElementById("resultado3").value=Math.round(calorias2menos*1000)/1000;
			var calorias1mas=caloriasMantenerPeso+500;
			document.getElementById("resultado4").value=Math.round(calorias1mas*1000)/1000;
			var calorias2mas=caloriasMantenerPeso+1000;
			document.getElementById("resultado5").value=Math.round(calorias2mas*1000)/1000;
		}
	}
}
