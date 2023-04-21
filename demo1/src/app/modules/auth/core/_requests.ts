import axios from 'axios'
import {UserModel} from './_models'
const API_URL = process.env.REACT_APP_API_URL

export const ADMIN_LOGIN_URL = `http://localhost:3000/api/v1/admin/login`
export const EMPLOYEE_LOGIN_URL = `http://localhost:3000/api/v1/employee/login`
export const REGISTER_URL = `http://localhost:3000/api/v1/employee/signup`
export const GET_USER_BY_ACCESSTOKEN_URL =
  'http://localhost:3000/api/v1/employee/findEmployeeByToken'
export const LOGIN_URL = `${API_URL}/login`
export const REQUEST_PASSWORD_URL = `${API_URL}/forgot_password`

// const navigate = useNavigate()
//admin login function
export async function admin_login(email: string, password: string) {
  const res = await axios.post(ADMIN_LOGIN_URL, {
    adminEmail: email,
    adminPassword: password,
  })
  //set token into local storage
  localStorage.setItem('token', res.data.token)
  if (res.data.success) {
    localStorage.setItem('admin', 'true')
  }

  console.log(res.data)
  return res
}

//employee login function
export async function employee_login(email: string, password: string) {
  const res = await axios.post(EMPLOYEE_LOGIN_URL, {
    employeeEmail: email,
    employeePassword: password,
  })
  //set token into local storage
  localStorage.setItem('token', res.data.token)
  if (res.data.success) {
    localStorage.setItem('employee', 'true')
  }
  console.log(res.data)
  return res
}

// Server should return AuthModel
export async function register(
  name: string,
  email: string,
  password: string,
  age: number,
  salary: number,
  contact: string,
  gender: string,
  selectedCountry: string,
  selectedState: string,
  selectedCity: string
) {
  let obj = {
    employeeName: name,
    employeeEmail: email,
    employeePassword: password,
    employeeAge: age,
    employeeSalary: salary,
    employeeContact: contact,
    employeeGender: gender,
    employeeCountry: selectedCountry,
    employeeState: selectedState,
    employeeCity: selectedCity,
  }

  try {
    const res = await axios.post(REGISTER_URL, obj)
    if (res.data.success) {
      return res
    } else {
      alert('Something went wrong')
    }
  } catch (error) {
    console.log(error)
  }
}

// Server should return object => { result: boolean } (Is Email in DB)
export function requestPassword(email: string) {
  return axios.post<{result: boolean}>(REQUEST_PASSWORD_URL, {
    email,
  })
}

export function getUserByToken(token: string) {
  return axios.get(GET_USER_BY_ACCESSTOKEN_URL, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
}
