import {useFormik} from 'formik'
import {useListView} from '../core/ListViewProvider'
// import {getUserById} from '../core/_requests'
import {useState, useEffect} from 'react'
// import {toAbsoluteUrl} from '../../../../../../_metronic/helpers/AssetHelpers'
import * as Yup from 'yup'
import {useAuth} from '../../../../auth/core/Auth'
import clsx from 'clsx'
// import {Link} from 'react-router-dom'
import axios from 'axios'
import {eventEmitter} from '../table/UsersTable'
const registrationSchema = Yup.object().shape({
  name: Yup.string()
    .min(3, 'Minimum 3 symbols')
    .max(20, 'Maximum 50 symbols')
    .required('First name is required'),
  email: Yup.string()
    .email('Wrong email format')
    .min(3, 'Minimum 3 symbols')
    .max(50, 'Maximum 50 symbols')
    .required('Email is required'),
  age: Yup.number()
    .min(10, 'Minimum 10 years')
    .max(100, 'Maximum 100 years')
    .required('Age is required'),
  contact: Yup.string()
    .min(10, 'Minimum 10 digits')
    .required('Contact is required')
    .matches(/^(0|91)?[6-9][0-9]{9}$/, 'Invalid format'),
  salary: Yup.number()
    .min(2000, 'Minimum 2000')
    .max(100000, 'Maximum 100000')
    .required('Salary is required')
    .typeError('Salary must be a number'),
  gender: Yup.string().required('Gender is required'),
  country: Yup.string().required('Country is required'),
  state: Yup.string().required('State is required'),
  city: Yup.string().required('City is required'),
})
const UserEditModalFormWrapper = () => {
  const {saveAuth, setCurrentUser} = useAuth()
  const [data, setData] = useState<any>(null)
  const [selectedCountry, setSelectedCountry] = useState('')
  const [selectedState, setSelectedState] = useState('')
  const [selectedCity, setSelectedCity] = useState('')
  //react states
  const [countries, setCountries] = useState([])
  const [states, setStates] = useState([])
  const [cities, setCities] = useState([])
  const [authToken, setAuthToken] = useState('')
  const [loading, setLoading] = useState(false)
  const {itemIdForUpdate, setItemIdForUpdate} = useListView()

  //load a single employee
  async function Load() {
    const varToken = localStorage.getItem('token')
    const result = await axios.get(
      'http://localhost:3000/api/v1/admin/viewone/' + itemIdForUpdate,
      {
        headers: {
          Authorization: 'Bearer ' + varToken,
        },
      }
    )
    const employee = result.data.data
    setData(employee)
    console.log(employee)
    setSelectedCountry(employee.employeeCountry)
    setSelectedState(employee.employeeState)
    setSelectedCity(employee.employeeCity)
  }
  useEffect(() => {
    ;(async () => await Load())()
  }, [])

  const initialValues = {
    name: data && data.employeeName ? data.employeeName : '',
    email: data && data.employeeEmail ? data.employeeEmail : '',
    age: data && data.employeeAge ? data.employeeAge : '',
    gender: data && data.employeeGender ? data.employeeGender : '',
    salary: data && data.employeeSalary ? data.employeeSalary : '',
    contact: data && data.employeeContact ? data.employeeContact : '',
    country: data && data.employeeCountry ? data.employeeCountry : '',
    state: data && data.employeeState ? data.employeeState : '',
    city: data && data.employeeCity ? data.employeeCity : '',
  }
  //load the set of states from the API
  const newStates = async (country: string) => {
    if (country) {
      const state_res = await axios.get(
        'https://www.universal-tutorial.com/api/states/' + country,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            Accept: 'application/json',
          },
        }
      )
      setStates(state_res.data)
    } else {
      setStates([])
    }
  }
  //load the set of states from the API
  const newCities = async (state: string) => {
    if (state) {
      const city_res = await axios.get('https://www.universal-tutorial.com/api/cities/' + state, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          Accept: 'application/json',
        },
      })
      setCities(city_res.data)
    } else {
      setCities([])
    }
  }
  //load the set of countries from the API
  useEffect(() => {
    ;(async () => {
      const API_KEY = 'udQhjU9b2Y61cuOTWzEQ-hiFHbrjv19l5D6OwOw7wgNfEFl5Rw7jW4azlDP46aqAlAg'
      const auth_token_res = await axios.get(
        'https://www.universal-tutorial.com/api/getaccesstoken',
        {
          headers: {
            'api-token': API_KEY,
            'user-email': 'hrutika567@gmail.com',
            Accept: 'application/json',
          },
        }
      )
      //country
      const auth_token = auth_token_res.data.auth_token
      setAuthToken(auth_token)
      const country_res = await axios.get('https://www.universal-tutorial.com/api/countries/', {
        headers: {
          Authorization: `Bearer ${auth_token}`,
          Accept: 'application/json',
        },
      })
      setCountries(country_res.data)
    })()
  }, [])
  const formik: any = useFormik({
    initialValues,
    enableReinitialize: true,
    validationSchema: registrationSchema,
    onSubmit: async (values, {setStatus, setSubmitting}) => {
      setLoading(true)
      console.log(values)
      const url = 'http://localhost:3000/api/v1/admin/update/' + itemIdForUpdate
      const varToken = localStorage.getItem('token')
      try {
        const res = await axios.patch(
          url,
          {
            employeeName: values.name,
            employeeEmail: values.email,
            employeeAge: values.age,
            employeeSalary: values.salary,
            employeeContact: values.contact,
            employeeGender: values.gender,
            employeeCountry: selectedCountry,
            employeeState: selectedState,
            employeeCity: selectedCity,
          },
          {
            headers: {
              Authorization: 'Bearer ' + varToken,
            },
          }
        )
        console.log(res)
        eventEmitter.emit('updateUserList')
        alert('Details updated successfully')
        setSubmitting(false)
        setLoading(false)
        Load()
        setItemIdForUpdate(undefined)
      } catch (error) {
        alert('Could not update details')
        console.error(error)
        // saveAuth(undefined)
        // setStatus('The registration details is incorrect')
        setSubmitting(false)
        setLoading(false)
      }
    },
  })
  useEffect(() => {
    newStates(selectedCountry)
    newCities(selectedState)
  }, [authToken, selectedCountry, selectedState])
  return (
    <div>
      <form
        className='form w-100 fv-plugins-bootstrap5 fv-plugins-framework'
        noValidate
        // id='kt_login_signup_form'
        onSubmit={formik.handleSubmit}
      >
        {formik.status && (
          <div className='mb-lg-15 alert alert-danger'>
            <div className='alert-text font-weight-bold'>{formik.status}</div>
          </div>
        )}

        {/* begin::Form group Firstname */}
        <div className='fv-row mb-8'>
          <label className='form-label fw-bolder text-dark fs-6'>Name</label>
          <input
            type='text'
            autoComplete='off'
            {...formik.getFieldProps('name')}
            className={clsx(
              'form-control bg-transparent',
              {
                'is-invalid': formik.touched.name && formik.errors.name,
              },
              {
                'is-valid': formik.touched.name && !formik.errors.name,
              }
            )}
          />
          {formik.touched.name && formik.errors.name && (
            <div className='fv-plugins-message-container'>
              <div className='fv-help-block'>
                <span role='alert'>{formik.errors.name}</span>
              </div>
            </div>
          )}
          {formik.touched.name && formik.errors.hasOwnProperty('name') && (
            <div className='fv-plugins-message-container'>
              <div className='fv-help-block'>
                <span role='alert'>{formik.errors.name}</span>
              </div>
            </div>
          )}
        </div>
        {/* end::Form group */}

        {/* begin::Form group Email */}
        <div className='fv-row mb-8'>
          <label className='form-label fw-bolder text-dark fs-6'>Email</label>
          <input
            placeholder='Email'
            type='email'
            autoComplete='off'
            {...formik.getFieldProps('email')}
            className={clsx(
              'form-control bg-transparent',
              {'is-invalid': formik.touched.email && formik.errors.email},
              {
                'is-valid': formik.touched.email && !formik.errors.email,
              }
            )}
          />
          {formik.touched.email && formik.errors.email && (
            <div className='fv-plugins-message-container'>
              <div className='fv-help-block'>
                <span role='alert'>{formik.errors.email}</span>
              </div>
            </div>
          )}
        </div>
        {/* end::Form group */}

        {/* begin::Form group age  */}
        <div className='fv-row mb-8'>
          <label className='form-label fw-bolder text-dark fs-6'>Age</label>
          <input
            placeholder='Enter your age'
            type='number'
            autoComplete='off'
            {...formik.getFieldProps('age')}
            className={clsx(
              'form-control bg-transparent',
              {
                'is-invalid': formik.touched.age && formik.errors.age,
              },
              {
                'is-valid': formik.touched.age && !formik.errors.age,
              }
            )}
          />
          {formik.touched.age && formik.errors.age && (
            <div className='fv-plugins-message-container'>
              <div className='fv-help-block'>
                <span role='alert'>{formik.errors.age}</span>
              </div>
            </div>
          )}
        </div>
        {/* end:: Form group age*/}

        {/* begin::Form group salary */}
        <div className='fv-row mb-8'>
          <label className='form-label fw-bolder text-dark fs-6'>Salary</label>
          <input
            placeholder='Enter your Salary'
            type='number'
            autoComplete='off'
            {...formik.getFieldProps('salary')}
            className={clsx(
              'form-control bg-transparent',
              {
                'is-invalid': formik.touched.salary && formik.errors.salary,
              },
              {
                'is-valid': formik.touched.salary && !formik.errors.salary,
              }
            )}
          />
          {formik.touched.salary && formik.errors.salary && (
            <div className='fv-plugins-message-container'>
              <div className='fv-help-block'>
                <span role='alert'>{formik.errors.salary}</span>
              </div>
            </div>
          )}
        </div>
        {/* end::Form group salary */}

        {/* begin::from group contact */}
        <div className='fv-row mb-8'>
          <label className='form-label fw-bolder text-dark fs-6'>Contact</label>
          <input
            placeholder='Enter your contact'
            type='number'
            autoComplete='off'
            {...formik.getFieldProps('contact')}
            className={clsx(
              'form-control bg-transparent',
              {
                'is-invalid': formik.touched.contact && formik.errors.contact,
              },
              {
                'is-valid': formik.touched.contact && !formik.errors.contact,
              }
            )}
          />
          {formik.touched.contact && formik.errors.contact && (
            <div className='fv-plugins-message-container'>
              <div className='fv-help-block'>
                <span role='alert'>{formik.errors.contact}</span>
              </div>
            </div>
          )}
        </div>
        {/* end::form group contact */}

        {/* begin::form group gender */}
        <div className='fv-row mb-8'>
          <label className='form-label fw-bolder text-dark fs-6'>Gender</label>
          <select
            className='form-select form-select-solid'
            aria-label='Select example'
            {...formik.getFieldProps('gender')}
          >
            <option>Select Gender</option>
            <option value='Male'>Male</option>
            <option value='Female'>Female</option>
            <option value='Others'>Others</option>
          </select>
        </div>
        {/* end::form group gender */}

        {/* begin::form group country */}
        <div className='fv-row mb-8'>
          <label className='form-label fw-bolder text-dark fs-6'>Country</label>
          <select
            className='form-select form-select-solid'
            aria-label='Select example'
            // {...formik.getFieldProps('country')}
            value={selectedCountry}
            onChange={(e) => {
              setSelectedCountry(e.target.value)
              newStates(e.target.value)
              formik.setFieldValue('country', e.target.value)
            }}
          >
            <option>Select Country</option>
            {countries.map((country: any) => {
              return (
                <option key={country.country_name} value={country.country_name}>
                  {country.country_name}
                </option>
              )
            })}
          </select>
        </div>
        {/* end::form group country */}

        {/* begin::form group state */}
        <div className='fv-row mb-8'>
          <label className='form-label fw-bolder text-dark fs-6'>State</label>
          <select
            className='form-select form-select-solid'
            {...formik.getFieldProps('state')}
            value={selectedState}
            onChange={(e) => {
              setSelectedState(e.target.value)
              newCities(e.target.value)
              formik.setFieldValue('state', e.target.value)
            }}
          >
            <option>Select State</option>
            {states.map((state: any) => {
              if (state.state_name === selectedState) {
                return (
                  <option key={state.state_name} value={state.state_name} selected>
                    {state.state_name}
                  </option>
                )
              }
              return (
                <option key={state.state_name} value={state.state_name}>
                  {state.state_name}
                </option>
              )
            })}
          </select>
        </div>
        {/*end::form group state */}

        {/* begin::form group city */}
        <div>
          <label className='form-label fw-bolder text-dark fs-6'>City</label>
          <select
            className='form-select form-select-solid'
            {...formik.getFieldProps('city')}
            value={selectedCity}
            onChange={(e) => {
              setSelectedCity(e.target.value)
              formik.setFieldValue('city', e.target.value)
            }}
          >
            <option value=''>Select City</option>

            {cities.map((city: any) => {
              if (city.city_name === selectedCity) {
                return (
                  <option key={city.city_name} value={city.city_name} selected>
                    {city.city_name}
                  </option>
                )
              }
              return (
                <option key={city.city_name} value={city.city_name}>
                  {city.city_name}
                </option>
              )
            })}
          </select>
        </div>
        <br />
        <br />
        {/* begin::Form group */}
        <div className='text-center'>
          <button
            type='submit'
            id='kt_sign_up_submit'
            className='btn btn-lg btn-primary w-100 mb-5'
            onClick={(e) => {
              e.preventDefault()
              formik.handleSubmit()
            }}
          >
            {!loading && <span className='indicator-label'>Update</span>}
            {loading && (
              <span className='indicator-progress' style={{display: 'block'}}>
                Please wait...{' '}
                <span className='spinner-border spinner-border-sm align-middle ms-2'></span>
              </span>
            )}
          </button>
        </div>
        {/* end::Form group */}
      </form>
    </div>
  )
}

export default UserEditModalFormWrapper
