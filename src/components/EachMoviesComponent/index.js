import {Component} from 'react'
import {Link, withRouter} from 'react-router-dom'
import Cookies from 'js-cookie'
import Loader from 'react-loader-spinner'
import format from 'date-fns/format'
import {FaPlay} from 'react-icons/fa'
import Header from '../HeaderComponent'
import Footer from '../FooterComponent'

import './index.css'

const apiStatusConstants = {
  initial: 'INITIAL',
  success: 'SUCCESS',
  failure: 'FAILURE',
  inProgress: 'IN_PROGRESS',
}

class EachMovieDetails extends Component {
  state = {
    MovieDetails: [],
    similarMovieDetails: [],
    apiStatus: apiStatusConstants.initial,
  }

  componentDidMount() {
    this.getEachMovieDetails()
  }

  componentDidUpdate(preProps) {
    const {match} = this.props
    const {params} = match
    const {id} = params

    // Check if the id parameter in the URL has changed
    if (id !== preProps.match.params.id) {
      // If it has changed, fetch new movie details
      this.getEachMovieDetails()
    }
  }

  getEachMovieDetails = async () => {
    this.setState({apiStatus: apiStatusConstants.inProgress})
    const {match} = this.props
    const {params} = match
    const {id} = params

    const jwtToken = Cookies.get('jwt_token')
    const url = `https://apis.ccbp.in/movies-app/movies/${id}`
    const options = {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${jwtToken}`,
      },
    }
    const response = await fetch(url, options)
    const data = await response.json()
    if (response.ok) {
      const updateEachMovieDetails = {
        id: data.movie_details.id,
        adult: data.movie_details.adult,
        backdropPath: data.movie_details.backdrop_path,
        budget: data.movie_details.budget,
        genres: data.movie_details.genres,
        overview: data.movie_details.overview,
        posterPath: data.movie_details.poster_path,
        releaseDate: data.movie_details.release_date,
        runtime: data.movie_details.runtime,
        spokenLanguage: data.movie_details.spoken_languages,
        title: data.movie_details.title,
        voteAverage: data.movie_details.vote_average,
        voteCount: data.movie_details.vote_count,
      }

      const updateSimilarMovies = data.movie_details.similar_movies.map(
        each => ({
          id: each.id,
          title: each.title,
          posterPath: each.poster_path,
        }),
      )

      this.setState({
        MovieDetails: updateEachMovieDetails,
        similarMovieDetails: updateSimilarMovies,
        apiStatus: apiStatusConstants.success,
      })
    } else {
      this.setState({apiStatus: apiStatusConstants.failure})
    }
  }

  runtime = () => {
    const {MovieDetails} = this.state
    const hours = Math.floor(MovieDetails.runtime / 60)
    const minutes = Math.floor(MovieDetails.runtime) % 60

    return `${hours}h ${minutes}m`
  }

  releasedYear = () => {
    const {MovieDetails} = this.state
    const {releaseDate} = MovieDetails
    if (releaseDate !== undefined) {
      return format(new Date(releaseDate), 'yyyy')
    }
    return null
  }

  formattedDate = () => {
    const {MovieDetails} = this.state
    const {releaseDate} = MovieDetails
    if (releaseDate !== undefined) {
      return format(new Date(releaseDate), 'do MMMM yyyy')
    }
    return null
  }

  renderLoadingView = () => (
    <div className="loader-container" testid="loader">
      <Loader type="TailSpin" color="#D81F26" height={50} width={50} />
    </div>
  )

  renderFailureView = () => (
    <div className="error-page-container">
      <div className="thumbnail-error-page">
        <img
          className="thumbnail-warning-icon"
          alt="failure view"
          src="https://res.cloudinary.com/dkbxi5qts/image/upload/v1660451047/movies%20prime%20app/alert-triangle_najaul.png"
        />
        <p className="thumbnail-error-msg">
          Something went wrong. Please try again
        </p>
        <button
          onClick={this.getEachMovieDetails}
          className="thumbnail-try-again-btn"
          type="button"
        >
          Try Again
        </button>
      </div>
    </div>
  )

  renderSuccessView = () => {
    const {MovieDetails, similarMovieDetails} = this.state

    const censorRating = MovieDetails.adult ? 'A' : 'U/A'

    return (
      <div className="EachMovieContainer">
        {/* Movie poster and header */}
        <div
          style={{backgroundImage: `url(${MovieDetails.backdropPath})`}}
          className="poster-container"
        >
          <Header />
          <div className="MovieHeadingContainer">
            <h1 className="heading">{MovieDetails.title}</h1>
            <div className="para-container">
              <p>{this.runtime()}</p>
              <p>{censorRating}</p>
              <p>{this.releasedYear()}</p>
            </div>
            <p className="description">{MovieDetails.overview}</p>
            <button className="playButton" type="button">
              <p>
                <FaPlay />
              </p>
              <p>Play</p>
            </button>
          </div>
        </div>

        {/* Movie content sections */}
        <div className="content-container">
          {/* Genres */}
          <div>
            <h1 className="content-heading">Genres</h1>
            {MovieDetails.genres.map(each => (
              <p key={each.id} className="para">
                {each.name}
              </p>
            ))}
          </div>
          {/* Audio Available */}
          <div>
            <h1 className="content-heading">Audio Available</h1>
            {MovieDetails.spokenLanguage.map(each => (
              <p key={each.id} className="para">
                {each.english_name}
              </p>
            ))}
          </div>
          {/* Rating Count and Average */}
          <div>
            <h1 className="content-heading">Rating Count</h1>
            <p className="para">{MovieDetails.voteCount}</p>
            <h1 className="content-heading">Rating Average</h1>
            <p className="para">{MovieDetails.voteAverage}</p>
          </div>
          {/* Budget and Release Date */}
          <div>
            <h1 className="content-heading">Budget</h1>
            <p className="para">{MovieDetails.budget}</p>
            <h1 className="content-heading">Release Date</h1>
            <p className="para">{this.formattedDate()}</p>
          </div>
        </div>

        {/* List of Similar Movies */}
        <div className="MoreLike-container">
          <h1 className="MovieContainer-heading">More like this</h1>
          <ul className="MovieOrderContainer">
            {similarMovieDetails.map(eachMovie => (
              <li className="EachSearchMovies" key={eachMovie.id}>
                <Link to={`/movies/${eachMovie.id}`}>
                  <div className="MovieItems">
                    <img
                      className="images"
                      src={eachMovie.posterPath}
                      alt={eachMovie.title}
                    />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <Footer />
      </div>
    )
  }

  renderMoviesView = () => {
    const {apiStatus} = this.state
    switch (apiStatus) {
      case apiStatusConstants.success:
        return this.renderSuccessView()
      case apiStatusConstants.inProgress:
        return this.renderLoadingView()
      case apiStatusConstants.failure:
        return this.renderFailureView()

      default:
        return null
    }
  }

  render() {
    return <>{this.renderMoviesView()}</>
  }
}

export default withRouter(EachMovieDetails)
