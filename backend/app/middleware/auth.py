from functools import wraps
from flask_jwt_extended import verify_jwt_in_request, get_jwt

def role_required(required_role):
    def wrapper(fn):
        @wraps(fn)
        def decorator(*args, **kwargs):
            verify_jwt_in_request()
            claims = get_jwt()
            if claims.get('role') != required_role:
                return {'message': f'{required_role} access required'}, 403
            return fn(*args, **kwargs)
        return decorator
    return wrapper

def roles_required(*required_roles):
    def wrapper(fn):
        @wraps(fn)
        def decorator(*args, **kwargs):
            verify_jwt_in_request()
            claims = get_jwt()
            if claims.get('role') not in required_roles:
                return {'message': 'Insufficient permissions'}, 403
            return fn(*args, **kwargs)
        return decorator
    return wrapper
