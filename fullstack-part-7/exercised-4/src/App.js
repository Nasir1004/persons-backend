import React, { useState, useEffect, useRef } from 'react'
import Blog from './components/Blog'
import BlogForm from './components/BlogForm'
import LoginForm from './components/LoginForm'
import Togglable from './components/Togglable'
import blogService from './services/blogs'
import loginService from './services/login'
import {  Button, Nav, Navbar } from 'react-bootstrap'


const ErrorNotification = ({ErrorMessage}) =>{
  if (ErrorMessage === null){
  return null
  }
  return(
    <div className='error'>
      {ErrorMessage}
    </div>
  )
}

const App = () => {
  const [blogs, setBlogs] = useState([])
  const [errorMessage, setErrorMessage] = useState(null)
  const [username, setUsername] = useState('') 
  const [password, setPassword] = useState('')
  const [user, setUser] = useState(null)
  const blogFormRef = useRef()
  
  useEffect(() => {
    blogService.getAll().then(blogs =>
      setBlogs( blogs )
    )  
  }, [])

  const addBlog = (blogObject) => {
    blogService
       .create(blogObject)
       .then(returnBlogs => {
         setBlogs(blogs.concat(returnBlogs))
        })
      }

  const handleLogout = (event) => {
    window.localStorage.removeItem(
      'loggedBlogappUser'
    ) 
  }


  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem('loggedBlogappUser')
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON)
      setUser(user)
      blogService.setToken(user.token)
    }
  }, [])

  const handleLogin = async (event) => {
    event.preventDefault()
    try {
      const user = await loginService.login({
        username, password,
      })

      window.localStorage.setItem(
        'loggedBlogappUser', JSON.stringify(user)
      )
      
      console.log(window.localStorage)
      blogService.setToken(user.token)
      setUser(user)
      setUsername('')
      setPassword('')
    } catch (exception) {
      setErrorMessage('wrong credentials')
      setTimeout(() => {
        setErrorMessage(null)
      }, 5000)
    }
  }

  const loginForm = () => (
    <Togglable buttonLabel='login'>
      <LoginForm
        username={username}
        password={password}
        handleUsernameChange={({ target }) => setUsername(target.value)}
        handlePasswordChange={({ target }) => setPassword(target.value)}
        handleSubmit={handleLogin}
      />
    </Togglable>
  )

  
  const blogForm = () => (
    <Togglable buttonLabel='new blog' ref={ blogFormRef }>
      <BlogForm createBlog={addBlog} />
    </Togglable>
  )

    return (
    <div>
        <>
  <Navbar bg="dark" variant="dark">
    <Navbar.Brand href="#home">Blog App</Navbar.Brand>
    <Nav className="mr-auto">
      {/* <Nav.Link href="#home">Home</Nav.Link>
      <Nav.Link href="#features">Features</Nav.Link>
      <Nav.Link href="#pricing">Pricing</Nav.Link> */}
    </Nav>

  </Navbar>
  </>
      <ErrorNotification ErrorMessage={errorMessage} />
      <div className="container">
      {user === null ?
        loginForm() :
        <div>
          <h4><Button variant="outline-secondary" onClick={handleLogout}>Logout</Button>{' '}</h4>
          {blogForm()}
        </div>
          }
      {blogs.map(blog =>
        <Blog key={blog.id} blog={blog} user={user} />
      )}
      </div>
    </div>
  )
}

export default App