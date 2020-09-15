// ******** 
// ******** Section 1: Main Imports used **********
// ******** 
//This returns a function, not an object or a class
const ExpressFunction = require('express');
const mainApp = ExpressFunction();
mainApp.use(ExpressFunction.json());
//This return a Class and not a function
const MyJoiClass = require('joi');


// ******** 
// ******** Section 2: Database Section - Either real or simulated. **********
// ******** 
const allGenresFromDB = [] ;

function getAllGenres() {
    return allGenresFromDB;
}

// ******** 
// ******** Section 3: URL Maps/Routes **********
// ******** 

const rootRoute = '/';
const genresRoute = '/api/genres';
const genresIdrootRoute = '/api/genres/:id';

// ******** 
// ******** Section 4: URL Handlers + View Layer combined **********
// ******** 

mainApp.get(rootRoute, (req, res) => {
    res.send("Welcome and Hello World!!!");
});

mainApp.get(genresRoute, (req, res) => {
    res.send(getAllGenres());
});

mainApp.get(genresIdrootRoute, (req, res) => {
    let courseFound = getGenreById(req, res) ;
    if (courseFound)
        res.send(courseFound);
});

mainApp.post (genresRoute, (req, res) => {
    console.log ('Cames Case: ' + captialize('thIS tIS'.toLowerCase()));
    if (!checkGenreTextError(req, res)) {
        if (!getGenreAlreadyExistsByName(req, res, req.body.genrename)) {
            let nextGenre = {
                id: getAllGenres().length + 1,
                genrename: captialize(req.body.genrename.trim().toLowerCase())
            } ;
            getAllGenres().push (nextGenre);
            res.send (getAllGenres()) ;
        }
    }
});

mainApp.delete (genresIdrootRoute, (req, res) => {
        let matchedC = getGenreById(req, res) ;
        if (matchedC) { 
            const index = getAllGenres().indexOf(matchedC);
            getAllGenres().splice(index, 1);
            res.send(getAllGenres());
        }
});

mainApp.put (genresIdrootRoute, (req, res) => {
    //Look up the ID 
    if (!checkGenreTextError(req, res)) {
        if (!getGenreAlreadyExistsByName(req, res, req.body.genrename)) {
            let matchedC = getGenreById(req, res) ;
            if (matchedC) {
                matchedC.genrename = captialize(req.body.genrename.trim().toLowerCase());
                res.send (getAllGenres()) ;
            }
        }
    }
})


// ******** 
// ******** Section 5: Inits and Util Functions **********
// ******** 


/* const {PORT = APP_PORT || 5001} = process.env;
var iHitCount = 5 ;
mainApp.listen(PORT, () => {
    console.log (`Listening on Port ${PORT} .... ${++iHitCount}`) ;
})*/

const appMainPaort = process.env.APP_MAIN_PORT || process.env.PORT || 3001;
mainApp.listen(appMainPaort, () => {
    console.log (`Started API Server. Listening on Port ${appMainPaort} .... `) ;
})

//This is code borrowwed from a Stack Overfloe post:
//It MIGHT NOT  work on characters with Accents. For demo purposes only
const captialize = words => words.split(' ').map( w =>  w.substring(0,1).toUpperCase()+ w.substring(1)).join(' ')


// ******** 
// ******** Section 6: Service Layer **********
// ******** 

function getGenreAlreadyExistsByName (request, response, genrename) {
    genrename = genrename.trim().toLowerCase();
    if (genrename && genrename.length > 0) {
        let matchedC = getAllGenres().find(c => c.genrename.trim().toLowerCase() === genrename);
        if (matchedC) {
            return errorGenre400Exists(request, response, matchedC.id);
        }
    }
    return false;
}

function getGenreById (request, response) {
    let validCourseId = getValidGenreId(request, response);
    if (validCourseId > 0) {
        let matchedC = getAllGenres().find(c => c.id === validCourseId);
        if (matchedC) return matchedC;
        errorGenreId404Error(request, response, request.params.id);
        return undefined;
    }
}

function getValidGenreId (request, response) {
    const idNum = parseInt(request.params.id, 10);
    if (idNum && idNum > 0) return idNum;
    errorGenre400Error(request, response, request.params.id);
    return 0;
}

// ******** 
// ******** Section 7: Data Service Validation/Display/Handle Errors **********
// ******** 

function checkGenreTextError (request, response) {
    let error = getGenreError(request.body) ;
    if (error) return errorGenreText400Error(request, response, error.details[0].message);
    return false;
}

//Set up JOI 
const GenreNameValidationSchema = MyJoiClass.object({
    genrename: MyJoiClass.string().trim().regex(/^[a-z\s]*$/i).min(3).required()
});
function getGenreError(genreinfo) {
    let { error, value } = GenreNameValidationSchema.validate(genreinfo);
    console.log (error);
    console.log (value);
    if (error) {
        return error;
    }
    return undefined;
}

// ******** 
// ******** Section 8: Error View (Response) Layer: Respond with 404 and 400 as needed **********
// ******** 

function errorGenreText400Error(request, response, error) {
    //Intent of this method: 
    //response.status(400).send(`Error in PUT body: ${putErrors.details[0].message}`);
    response.status(400).send(`Error in ${request.method} request: ${error}`);
    return true;
}

function errorGenreId404Error(request, response, id) {
    response.status(404).send(`For ${request.method} request, unable to locate Genre with ID : ${id}`);
    return true;
}

function errorGenre400Error(request, response, id) {
    //response.status(400).send(`Error in PUT body: ${putErrors.details[0].message}`);
    response.status(400).send(`For ${request.method} request, Invalid Genre ID : ${id}`);
    return true;
}

function errorGenre400Exists(request, response, id) {
    //response.status(400).send(`Error in PUT body: ${putErrors.details[0].message}`);
    response.status(400).send(`For ${request.method} request, Genre already Exists with ID : ${id}`);
    return true;
}


