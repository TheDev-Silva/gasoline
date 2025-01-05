export const apiHome = async () => {

    await fetch('http://192.168.0.13:3000')
}
export const apiRegister = async () =>{
    await fetch('http://192.168.0.13:3000/register')
}
export const apiFuelPrice = async () =>{
    await fetch('http://192.168.0.13:3000/fuel-price')
}
