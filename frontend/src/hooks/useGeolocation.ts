type GeoPosition = { lat: number; lng: number; accuracy: number };

function codeToMessage(code: number): string {
  switch (code) {
    case GeolocationPositionError.PERMISSION_DENIED:
      return 'Permissão de localização negada. Verifique as configurações do navegador.';
    case GeolocationPositionError.POSITION_UNAVAILABLE:
      return 'Posição indisponível. Tente novamente.';
    case GeolocationPositionError.TIMEOUT:
      return 'Tempo de espera esgotado. Verifique sua conexão.';
    default:
      return 'Erro ao obter localização.';
  }
}

export function useGeolocation() {
  function getCurrentPosition(): Promise<GeoPosition> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocalização não é suportada por este navegador.'));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) =>
          resolve({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
          }),
        (err) => reject(new Error(codeToMessage(err.code))),
        { enableHighAccuracy: true, timeout: 10_000, maximumAge: 0 }
      );
    });
  }

  return { getCurrentPosition };
}
