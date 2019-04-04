import { Router } from 'express';
import User from '../controllers/users.controller';

const router = Router();

router.post('/auth/signup', User.create)
	  .post('/auth/signin', User.login);

export default router;
