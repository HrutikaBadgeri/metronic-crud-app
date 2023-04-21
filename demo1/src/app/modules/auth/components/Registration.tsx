/* eslint-disable react/jsx-no-target-blank */
/* eslint-disable jsx-a11y/anchor-is-valid */
import {useState, useEffect} from 'react'
import {useFormik} from 'formik'
import * as Yup from 'yup'
import clsx from 'clsx'
import {getUserByToken, register} from '../core/_requests'
import {Link} from 'react-router-dom'
import {toAbsoluteUrl} from '../../../../_metronic/helpers'
import {PasswordMeterComponent} from '../../../../_metronic/assets/ts/components'
import {useAuth} from '../core/Auth'
import {useNavigate} from 'react-router-dom'
import axios from 'axios'
const initialValues = {
  name: '',
  email: '',
  password: '',
  age: '',
  contact: '',
  salary: '',
  gender: '',
  country: '',
  state: '',
  city: '',
  acceptTerms: false,
}

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
  password: Yup.string()
    .min(3, 'Minimum 3 symbols')
    .max(50, 'Maximum 50 symbols')
    .required('Password is required'),
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
  acceptTerms: Yup.bool().required('You must accept the terms and conditions'),
})

export function Registration() {
  const navigate = useNavigate()
  const {saveAuth, setCurrentUser} = useAuth()
  //react states
  const [countries, setCountries] = useState([])
  const [states, setStates] = useState([])
  const [cities, setCities] = useState([])
  const [authToken, setAuthToken] = useState('')
  const [selectedCountry, setSelectedCountry] = useState('')
  const [selectedState, setSelectedState] = useState('')
  const [selectedCity, setSelectedCity] = useState('')
  const [loading, setLoading] = useState(false)
  // const {saveAuth, setCurrentUser} = useAuth()
  const formik = useFormik({
    initialValues,
    validationSchema: registrationSchema,
    onSubmit: async (values, {setStatus, setSubmitting}) => {
      setLoading(true)
      try {
        const res: any = await register(
          values.name,
          values.email,
          values.password,
          parseInt(values.age),
          parseInt(values.salary),
          values.contact,
          values.gender,
          values.country,
          values.state,
          values.city
        )
        if (res.data.success) {
          setStatus('Registration Successful')
          navigate('/auth', {replace: true})
          const employee: any = await getUserByToken(res.data.token)
          saveAuth(employee.data)
          setCurrentUser(employee.data)
          console.log(employee.data)
          setCurrentUser(employee.data)
        } else {
          setStatus('Registration Failed')
          setSubmitting(false)
          setLoading(false)
        }
      } catch (error) {
        console.error(error)
        saveAuth(undefined)
        setStatus('The registration details is incorrect')
        setSubmitting(false)
        setLoading(false)
      }
    },
  })

  useEffect(() => {
    PasswordMeterComponent.bootstrap()
  }, [])

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

  return (
    <form
      className='form w-100 fv-plugins-bootstrap5 fv-plugins-framework'
      noValidate
      id='kt_login_signup_form'
      onSubmit={formik.handleSubmit}
    >
      {/* begin::Heading */}
      <div className='text-center mb-11'>
        {/* begin::Title */}
        <h1 className='text-dark fw-bolder mb-3'>Sign Up</h1>
        {/* end::Title */}

        <div className='text-gray-500 fw-semibold fs-6'>Your Social Campaigns</div>
      </div>
      {/* end::Heading */}

      {/* begin::Login options */}
      <div className='row g-3 mb-9'>
        {/* begin::Col */}
        <div className='col-md-6'>
          {/* begin::Google link */}
          <a
            href='#'
            className='btn btn-flex btn-outline btn-text-gray-700 btn-active-color-primary bg-state-light flex-center text-nowrap w-100'
          >
            <img
              alt='Logo'
              src={toAbsoluteUrl('/media/svg/brand-logos/google-icon.svg')}
              className='h-15px me-3'
            />
            Sign in with Google
          </a>
          {/* end::Google link */}
        </div>
        {/* end::Col */}

        {/* begin::Col */}
        <div className='col-md-6'>
          {/* begin::Google link */}
          <a
            href='#'
            className='btn btn-flex btn-outline btn-text-gray-700 btn-active-color-primary bg-state-light flex-center text-nowrap w-100'
          >
            <img
              alt='Logo'
              src={toAbsoluteUrl('/media/svg/brand-logos/apple-black.svg')}
              className='theme-light-show h-15px me-3'
            />
            <img
              alt='Logo'
              src={toAbsoluteUrl('/media/svg/brand-logos/apple-black-dark.svg')}
              className='theme-dark-show h-15px me-3'
            />
            Sign in with Apple
          </a>
          {/* end::Google link */}
        </div>
        {/* end::Col */}
      </div>
      {/* end::Login options */}

      <div className='separator separator-content my-14'>
        <span className='w-125px text-gray-500 fw-semibold fs-7'>Or with email</span>
      </div>

      {formik.status && (
        <div className='mb-lg-15 alert alert-danger'>
          <div className='alert-text font-weight-bold'>{formik.status}</div>
        </div>
      )}

      {/* begin::Form group Firstname */}
      <div className='fv-row mb-8'>
        <label className='form-label fw-bolder text-dark fs-6'>Name</label>
        <input
          placeholder='Enter your name'
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

      {/* begin::Form group Password */}
      <div className='fv-row mb-8' data-kt-password-meter='true'>
        <div className='mb-1'>
          <label className='form-label fw-bolder text-dark fs-6'>Password</label>
          <div className='position-relative mb-3'>
            <input
              type='password'
              placeholder='Password'
              autoComplete='off'
              {...formik.getFieldProps('password')}
              className={clsx(
                'form-control bg-transparent',
                {
                  'is-invalid': formik.touched.password && formik.errors.password,
                },
                {
                  'is-valid': formik.touched.password && !formik.errors.password,
                }
              )}
            />
            {formik.touched.password && formik.errors.password && (
              <div className='fv-plugins-message-container'>
                <div className='fv-help-block'>
                  <span role='alert'>{formik.errors.password}</span>
                </div>
              </div>
            )}
          </div>
          {/* begin::Meter */}
          <div
            className='d-flex align-items-center mb-3'
            data-kt-password-meter-control='highlight'
          >
            <div className='flex-grow-1 bg-secondary bg-active-success rounded h-5px me-2'></div>
            <div className='flex-grow-1 bg-secondary bg-active-success rounded h-5px me-2'></div>
            <div className='flex-grow-1 bg-secondary bg-active-success rounded h-5px me-2'></div>
            <div className='flex-grow-1 bg-secondary bg-active-success rounded h-5px'></div>
          </div>
          {/* end::Meter */}
        </div>
        <div className='text-muted'>
          Use 8 or more characters with a mix of letters, numbers & symbols.
        </div>
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
          // {...formik.getFieldProps('state')}
          value={selectedState}
          onChange={(e) => {
            setSelectedState(e.target.value)
            newCities(e.target.value)
            formik.setFieldValue('state', e.target.value)
          }}
        >
          <option>Select State</option>
          {states.map((state: any) => {
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
            return (
              <option key={city.city_name} value={city.city_name}>
                {city.city_name}
              </option>
            )
          })}
        </select>
      </div>
      {/* end::form group city */}
      {/* begin::Form group */}
      <div className='fv-row mb-8'>
        <label className='form-check form-check-inline' htmlFor='kt_login_toc_agree'>
          <input
            className='form-check-input'
            type='checkbox'
            id='kt_login_toc_agree'
            {...formik.getFieldProps('acceptTerms')}
          />
          <span>
            I Accept the{' '}
            <a
              href='https://keenthemes.com/metronic/?page=faq'
              target='_blank'
              className='ms-1 link-primary'
            >
              Terms
            </a>
            .
          </span>
        </label>
        {formik.touched.acceptTerms && formik.errors.acceptTerms && (
          <div className='fv-plugins-message-container'>
            <div className='fv-help-block'>
              <span role='alert'>{formik.errors.acceptTerms}</span>
            </div>
          </div>
        )}
      </div>
      {/* end::Form group */}
      <br />
      {/* begin::Form group */}
      <div className='text-center'>
        <button
          type='submit'
          id='kt_sign_up_submit'
          className='btn btn-lg btn-primary w-100 mb-5'
          disabled={formik.isSubmitting || !formik.isValid || !formik.values.acceptTerms}
        >
          {!loading && <span className='indicator-label'>Sign up</span>}
          {loading && (
            <span className='indicator-progress' style={{display: 'block'}}>
              Please wait...{' '}
              <span className='spinner-border spinner-border-sm align-middle ms-2'></span>
            </span>
          )}
        </button>
        <Link to='/auth/login'>
          <button
            type='button'
            id='kt_login_signup_form_cancel_button'
            className='btn btn-lg btn-light-primary w-100 mb-5'
          >
            Cancel
          </button>
        </Link>
      </div>
      {/* end::Form group */}
    </form>
  )
}
