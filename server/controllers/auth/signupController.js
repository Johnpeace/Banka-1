/* eslint-disable consistent-return */
import jwt from 'jsonwebtoken';
import { config } from 'dotenv';
import User from '../../models/user';
import validateSignUpInput from '../../validation/authentication/signUp';
import { hash /* setAuthToken */ } from '../../utils/helpers';

config();

const secret = process.env.SECRET || 'UseMeInstead';

const SignupController = {
  /**
   * @description - Creates new user
   *
   * @param  {object} req - request
   *
   * @param  {object} res - response
   *
   * @return {json} - jsonObject containing status, token and user data/error
   *
   * Route: POST: /auth/signup
   *
   * */
  signup(req, res) {
    let { email } = req.body;
    const {
      firstName, lastName, password,
    } = req.body;

    const {
      errors,
      isValid,
    } = validateSignUpInput(req.body);

    if (!isValid) {
      return res.status(400).json({ status: 400, error: errors });
    }

    email = email.toLowerCase().trim();

    User.findBy('email', email, res)
      .then((result) => {
        if (result.rows.length > 0) {
          return res.status(409).json({
            status: 409,
            error: 'Account already exists',
          });
        }
      })
      .catch(err => res.status(500).json({
        status: 500,
        error: `An error occured. Please try again - ${err}`,
      }));

    hash(password).then((hashed) => {
      const newUser = {
        firstName, lastName, email, password: hashed,
      };

      User.save(newUser)
        .then((result) => {
          if (!result || result == 'undefined') {
            return res.status(500).json({
              status: 500,
              error: 'An error occured. Please try again',
            })
          }
          const user = result.rows[0];
          // eslint-disable-next-line consistent-return
          jwt.sign({ id: user.id, type: user.type }, secret, { expiresIn: '1h' }, (err, token) => {
            if (err) {
              return res.status(403).json({
                status: 403,
                error: `Some error occured - ${err}`,
              });
            }
            return res.status(201).json({
              status: 201,
              data: {
                token,
                id: user.id,
                firstName: user.firstname,
                lastName: user.lastname,
                email: user.email,
              },
            });
          });
        })
        .catch(err => res.status(500).json({
          status: 500,
          error: `An occured while creating account. Please try again - ${err}`,
        }));
    });
  },
};

export default SignupController;
