
from fastapi import HTTPException, status


class APIException(HTTPException):
    def __init__(self, status_code: int, code: str, message: str):
        super().__init__(status_code=status_code, detail={"code": code, "message": message})
        self.code = code
        self.message = message


class UnauthorizedException(APIException):
    def __init__(self, message: str = "Authentication required."):
        super().__init__(status_code=status.HTTP_401_UNAUTHORIZED, code="UNAUTHORIZED", message=message)


class ForbiddenException(APIException):
    def __init__(self, message: str = "Permission denied."):
        super().__init__(status_code=status.HTTP_403_FORBIDDEN, code="FORBIDDEN", message=message)


class NotFoundException(APIException):
    def __init__(self, message: str = "Resource not found."):
        super().__init__(status_code=status.HTTP_404_NOT_FOUND, code="NOT_FOUND", message=message)


class BadRequestException(APIException):
    def __init__(self, message: str = "Bad request."):
        super().__init__(status_code=status.HTTP_400_BAD_REQUEST, code="BAD_REQUEST", message=message)


class ConflictException(APIException):
    def __init__(self, message: str = "Conflict occurred."):
        super().__init__(status_code=status.HTTP_409_CONFLICT, code="CONFLICT", message=message)


class UnprocessableEntityException(APIException):
    def __init__(self, message: str = "Unprocessable entity."):
        super().__init__(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, code="UNPROCESSABLE_ENTITY", message=message
        )


class InternalServerErrorException(APIException):
    def __init__(self, message: str = "Internal server error."):
        super().__init__(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, code="INTERNAL_SERVER_ERROR", message=message
        )
