import {useState, useRef, useEffect, ChangeEvent} from 'react'
import {useIdleTimer} from 'react-idle-timer'
import Cards from 'react-credit-cards-2'
import {ToastContainer, toast} from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css';
import 'react-credit-cards-2/dist/es/styles-compiled.css'



const CreditCardForm = () => {
  const [cardDetails, setCardDetails] = useState({
    cvc: '',
    expiry: '',
    name: '',
    number: ''
  })

  const [isButtonDisabled, setIsButtonDisabled] = useState(false)
  const [timeLeft, setTimeLeft] = useState(10)

  const idleTimerRef = useRef<any>(null)
  const intervalRef = useRef<number>(0)
  const hasShownToast = useRef(false)

  const handleOnIdle = () => {

    if (hasShownToast.current) return

    setCardDetails({
      cvc: '',
      expiry: '',
      name: '',
      number: ''
    })

    setIsButtonDisabled(true)
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    setTimeLeft(0);
    toast.info('Ваши данные были очищены из-за бездействия.');
    hasShownToast.current = true
  }

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {

    const {name, value} = e.target

    setCardDetails((prevDetails) => ({
      ...prevDetails,
      [name]: value
    }))

    setIsButtonDisabled(false)
    setTimeLeft(10)

    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    startCountdown()
  }

  const startCountdown = () => {
    intervalRef.current = setInterval(() => {
      setTimeLeft((prevTimeLeft) => {
        if (prevTimeLeft <= 1) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
          }
          handleOnIdle()
          return 0
        }
        return prevTimeLeft - 1
      })
    }, 1000)
  }

  useIdleTimer({
    ref: idleTimerRef,
    timeout: 10000, // 10 секунд бездействия
    onIdle: handleOnIdle,
    onActive: () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      setTimeLeft(10)
      hasShownToast.current = false
      startCountdown()
    },
    debounce: 500
  })

  useEffect(() => {
    startCountdown();
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
  }, [])

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`
  };

  return (
    <div >
      <h1 className="text-2xl font-bold mb-6">React Credit Cards 2, React Idle Timer, React-Toastify</h1>
      <ToastContainer />
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
        <Cards
          cvc={cardDetails.cvc}
          expiry={cardDetails.expiry}
          name={cardDetails.name}
          number={cardDetails.number}
        />
        <form>
          <div>
            <input
              type="text"
              name="number"
              placeholder="Card Number"
              value={cardDetails.number}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <input
              type="text"
              name="name"
              placeholder="Name"
              value={cardDetails.name}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <input
              type="text"
              name="expiry"
              placeholder="MM/YY Expiry"
              value={cardDetails.expiry}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <input
              type="text"
              name="cvc"
              placeholder="CVC"
              value={cardDetails.cvc}
              onChange={handleInputChange}
            />
          </div>
          <button
            type="button"
            disabled={isButtonDisabled}
          >
            Submit
          </button>
        </form>
        {timeLeft > 0 && (
          <p>
            Time reset: {formatTime(timeLeft)}
          </p>
        )}
      </div>
    </div>
  )
}

export default CreditCardForm
