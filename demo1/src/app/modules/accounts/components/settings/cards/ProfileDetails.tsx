import React, {useState} from 'react'
import {toAbsoluteUrl} from '../../../../../../_metronic/helpers'
import {IProfileDetails, profileDetailsInitValues as initialValues} from '../SettingsModel'
import * as Yup from 'yup'
import {useFormik} from 'formik'
import {useListView} from '../../../../apps/user-management/users-list/core/ListViewProvider'
import axios from 'axios'
import {useEffect} from 'react'

const profileDetailsSchema = Yup.object().shape({
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

const ProfileDetails: React.FC = () => {
  const [loading, setLoading] = useState(false)
  // const updateData = (fieldsToUpdate: Partial<IProfileDetails>): void => {
  //   const updatedData = Object.assign(data, fieldsToUpdate)
  //   setData(updatedData)
  // }

  // const formik = useFormik<IProfileDetails>({
  //   initialValues,
  //   validationSchema: profileDetailsSchema,
  //   onSubmit: (values) => {
  //     setLoading(true)
  //     setTimeout(() => {
  //       values.communications.email = data.communications.email
  //       values.communications.phone = data.communications.phone
  //       values.allowMarketing = data.allowMarketing
  //       const updatedData = Object.assign(data, values)
  //       setData(updatedData)
  //       setLoading(false)
  //     }, 1000)
  //   },
  // })
  const [data, setData] = useState<any>(null)
  const [selectedCountry, setSelectedCountry] = useState('')
  const [selectedState, setSelectedState] = useState('')
  const [selectedCity, setSelectedCity] = useState('')

  //react states
  const [countries, setCountries] = useState([])
  const [states, setStates] = useState([])
  const [cities, setCities] = useState([])
  const [authToken, setAuthToken] = useState('')

  //load details of a single employee
  async function Load() {
    console.log('hello')
    const varToken = localStorage.getItem('token')
    const result = await axios.get('http://localhost:3000/api/v1/employee/getempdetails', {
      headers: {
        Authorization: 'Bearer ' + varToken,
      },
    })
    console.log(result.data.data)
    const employee = result.data.data
    setData(employee)
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
    validationSchema: profileDetailsSchema,
    onSubmit: async (values, {setStatus, setSubmitting}) => {
      setLoading(true)
      console.log(values)
      const url = 'http://localhost:3000/api/v1/employee/updateDetails/'
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
        alert('Details updated successfully')
        setSubmitting(false)
        setLoading(false)
        Load()
      } catch (error) {
        alert('Could not update details')
        console.error(error)
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
    <div className='card mb-5 mb-xl-10'>
      <div
        className='card-header border-0 cursor-pointer'
        role='button'
        data-bs-toggle='collapse'
        data-bs-target='#kt_account_profile_details'
        aria-expanded='true'
        aria-controls='kt_account_profile_details'
      >
        <div className='card-title m-0'>
          <h3 className='fw-bolder m-0'>Profile Details</h3>
        </div>
      </div>

      <div id='kt_account_profile_details' className='collapse show'>
        <form onSubmit={formik.handleSubmit} noValidate className='form'>
          <div className='card-body border-top p-9'>
            {/* <div className='row mb-6'>
              <label className='col-lg-4 col-form-label fw-bold fs-6'>Avatar</label>
              <div className='col-lg-8'>
                <div
                  className='image-input image-input-outline'
                  data-kt-image-input='true'
                  style={{backgroundImage: `url(${toAbsoluteUrl('/media/avatars/blank.png')})`}}
                >
                  <div
                    className='image-input-wrapper w-125px h-125px'
                    style={{backgroundImage: `url(${toAbsoluteUrl(data.avatar)})`}}
                  ></div>
                </div>
              </div>
            </div> */}

            <div className='row mb-6'>
              <label className='col-lg-4 col-form-label required fw-bold fs-6'>Name</label>

              <div className='col-lg-8'>
                <div className='row'>
                  <div className='col-lg-6 fv-row'>
                    <input
                      type='text'
                      className='form-control form-control-lg form-control-solid mb-3 mb-lg-0'
                      placeholder='First name'
                      {...formik.getFieldProps('name')}
                    />
                    {formik.touched.name && formik.errors.name && (
                      <div className='fv-plugins-message-container'>
                        <div className='fv-help-block'>{formik.errors.name}</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* email */}
            <div className='row mb-6'>
              <label className='col-lg-4 col-form-label required fw-bold fs-6'>Email</label>

              <div className='col-lg-8 fv-row'>
                <input
                  type='text'
                  className='form-control form-control-lg form-control-solid'
                  placeholder='Company name'
                  {...formik.getFieldProps('email')}
                />
                {formik.touched.company && formik.errors.company && (
                  <div className='fv-plugins-message-container'>
                    <div className='fv-help-block'>{formik.errors.company}</div>
                  </div>
                )}
              </div>
            </div>

            {/* age */}
            <div className='row mb-6'>
              <label className='col-lg-4 col-form-label required fw-bold fs-6'>Age</label>

              <div className='col-lg-8 fv-row'>
                <input
                  type='text'
                  className='form-control form-control-lg form-control-solid'
                  placeholder='Company name'
                  {...formik.getFieldProps('age')}
                />
                {formik.touched.company && formik.errors.company && (
                  <div className='fv-plugins-message-container'>
                    <div className='fv-help-block'>{formik.errors.company}</div>
                  </div>
                )}
              </div>
            </div>

            {/* salary */}
            <div className='row mb-6'>
              <label className='col-lg-4 col-form-label required fw-bold fs-6'>Salary</label>

              <div className='col-lg-8 fv-row'>
                <input
                  type='text'
                  className='form-control form-control-lg form-control-solid'
                  placeholder='Company name'
                  {...formik.getFieldProps('salary')}
                />
                {formik.touched.company && formik.errors.company && (
                  <div className='fv-plugins-message-container'>
                    <div className='fv-help-block'>{formik.errors.company}</div>
                  </div>
                )}
              </div>
            </div>

            {/* contact */}
            <div className='row mb-6'>
              <label className='col-lg-4 col-form-label fw-bold fs-6'>
                <span className='required'>Contact Phone</span>
              </label>

              <div className='col-lg-8 fv-row'>
                <input
                  type='tel'
                  className='form-control form-control-lg form-control-solid'
                  placeholder='Phone number'
                  {...formik.getFieldProps('contact')}
                />
                {formik.touched.contactPhone && formik.errors.contactPhone && (
                  <div className='fv-plugins-message-container'>
                    <div className='fv-help-block'>{formik.errors.contactPhone}</div>
                  </div>
                )}
              </div>
            </div>

            {/* gender */}
            <div className='row mb-6'>
              <label className='col-lg-4 col-form-label required fw-bold fs-6'>Gender</label>

              <div className='col-lg-8 fv-row'>
                <input
                  type='text'
                  className='form-control form-control-lg form-control-solid'
                  placeholder='Company name'
                  {...formik.getFieldProps('gender')}
                />
                {formik.touched.company && formik.errors.company && (
                  <div className='fv-plugins-message-container'>
                    <div className='fv-help-block'>{formik.errors.company}</div>
                  </div>
                )}
              </div>
            </div>

            {/* country */}
            <div className='row mb-6'>
              <label className='col-lg-4 col-form-label required fw-bold fs-6'>Country</label>

              <div className='col-lg-8 fv-row'>
                {/* <input
                  type='text'
                  className='form-control form-control-lg form-control-solid'
                  placeholder='Company name'
                  {...formik.getFieldProps('country')}
                /> */}
                <select
                  className='form-control form-control-lg form-control-solid'
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
                {formik.touched.company && formik.errors.company && (
                  <div className='fv-plugins-message-container'>
                    <div className='fv-help-block'>{formik.errors.company}</div>
                  </div>
                )}
              </div>
            </div>

            {/* state */}
            <div className='row mb-6'>
              <label className='col-lg-4 col-form-label required fw-bold fs-6'>State</label>

              <div className='col-lg-8 fv-row'>
                {/* <input
                  type='text'
                  className='form-control form-control-lg form-control-solid'
                  placeholder='Company name'
                  {...formik.getFieldProps('state')}
                /> */}
                <select
                  className='form-control form-control-lg form-control-solid'
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
                {formik.touched.company && formik.errors.company && (
                  <div className='fv-plugins-message-container'>
                    <div className='fv-help-block'>{formik.errors.company}</div>
                  </div>
                )}
              </div>
            </div>

            {/* city */}
            <div className='row mb-6'>
              <label className='col-lg-4 col-form-label required fw-bold fs-6'>City</label>

              <div className='col-lg-8 fv-row'>
                {/* <input
                  type='text'
                  className='form-control form-control-lg form-control-solid'
                  placeholder='Company name'
                  {...formik.getFieldProps('city')}
                /> */}
                <select
                  className='form-control form-control-lg form-control-solid'
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
                {formik.touched.company && formik.errors.company && (
                  <div className='fv-plugins-message-container'>
                    <div className='fv-help-block'>{formik.errors.company}</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className='card-footer d-flex justify-content-end py-6 px-9'>
            <button type='submit' className='btn btn-primary' disabled={loading}>
              {!loading && 'Save Changessss'}
              {loading && (
                <span className='indicator-progress' style={{display: 'block'}}>
                  Please wait...{' '}
                  <span className='spinner-border spinner-border-sm align-middle ms-2'></span>
                </span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export {ProfileDetails}
