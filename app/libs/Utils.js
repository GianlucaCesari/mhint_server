module.exports = {

  rounded: function(num, precision) {
    num = num.toString().replace(/\ |\,/g, '');
    if (isNaN(num))
      num = "0";
    cents = Math.floor((num * 100 + 0.5) % 100);
    num = Math.floor((num * 100 + 0.5) / 100).toString();
    if (cents < 10)
      cents = "0" + cents;
    for (var i = 0; i < Math.floor((num.length - (1 + i)) / 3); i++)
      num = num.substring(0, num.length - (4 * i + 3)) + num.substring(num.length - (4 * i + 3));
    if (precision > 0) {
      return (' ' + num + ',' + cents);
    } else if (precision == 0) {
      return (' ' + num);
    }
  },

  dailyCaloriesBMI: function(h, w, e, s, activityIndex) {
    /*Definimos variables*/
    altura = h.toString().replace(',', '.');

    peso = w.toString().replace(',', '.');

    edad = e.toString().replace(',', '.');

    var indiceSexo = s;

    var indiceNivelActividad = activityIndex;

    var valorNivelActividad = 0;
    if (indiceNivelActividad == 0) {
      valorNivelActividad = 1.2;
    } else if (indiceNivelActividad == 1) {
      valorNivelActividad = 1.37;
    } else if (indiceNivelActividad == 2) {
      valorNivelActividad = 1.54;
    } else if (indiceNivelActividad == 3) {
      valorNivelActividad = 1.72;
    } else if (indiceNivelActividad == 4) {
      valorNivelActividad = 1.9;
    }
    if (indiceSexo == 0) {
      var variableAuxiliar = 10 * peso + 6.25 * altura - 5 * edad + 5;
      var caloriasMantenerPeso = valorNivelActividad * variableAuxiliar;
      res1 = Math.round(caloriasMantenerPeso * 1000) / 1000;
      var calorias1menos = caloriasMantenerPeso - 500;
      res2 = Math.round(calorias1menos * 1000) / 1000;
      var calorias2menos = caloriasMantenerPeso - 1000;
      res3 = Math.round(calorias2menos * 1000) / 1000;
      var calorias1mas = caloriasMantenerPeso + 500;
      res4 = Math.round(calorias1mas * 1000) / 1000;
      var calorias2mas = caloriasMantenerPeso + 1000;
      res5 = Math.round(calorias2mas * 1000) / 1000;
    } else {
      var variableAuxiliar = 10 * peso + 6.25 * altura - 5 * edad - 161;
      var caloriasMantenerPeso = valorNivelActividad * variableAuxiliar;
      res1 = Math.round(caloriasMantenerPeso * 1000) / 1000;
      var calorias1menos = caloriasMantenerPeso - 500;
      res2 = Math.round(calorias1menos * 1000) / 1000;
      var calorias2menos = caloriasMantenerPeso - 1000;
      res3 = Math.round(calorias2menos * 1000) / 1000;
      var calorias1mas = caloriasMantenerPeso + 500;
      res4 = Math.round(calorias1mas * 1000) / 1000;
      var calorias2mas = caloriasMantenerPeso + 1000;
      res5 = Math.round(calorias2mas * 1000) / 1000;
    }
  },

  distanceKM: function(lat1, lon1, lat2, lon2, unit) {
    var radlat1 = Math.PI * lat1 / 180
    var radlat2 = Math.PI * lat2 / 180
    var theta = lon1 - lon2
    var radtheta = Math.PI * theta / 180
    var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
    dist = Math.acos(dist)
    dist = dist * 180 / Math.PI
    dist = dist * 60 * 1.1515
    if (unit == "K") {
      dist = dist * 1.609344
    }
    return dist.toFixed(2);
  },

  getDistance: function(point1, point2) {
    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(point2.lat - point1.lat); // deg2rad below
    var dLon = deg2rad(point1.long - point1.long);
    var a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(point1.lat)) * Math.cos(deg2rad(point2.lat)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c; // Distance in km
    return d * 1.609344;
  },

  deg2rad: function(deg) {
    return deg * (Math.PI / 180)
  }
}
