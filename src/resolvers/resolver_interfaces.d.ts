// Type interfaces
export interface List {
    id: number
    name: string
    tasks: Task[]
    userId: number
    public: boolean
}

export interface User {
    id: number
    username: string
    email: string
    password: string
}

export interface Task {
    id: number
    list: List
    text: string
    done: boolean
    listId: number
    userId: number
}


// Context interfaces
interface IAuth {
    id: number,
    email: string,
    iat: number,
    exp: number,
}

interface IModels {
    List: any,
    User: any,
    Task: any
}

export interface IContext {
    auth: IAuth,
    models: IModels | any,
    jwt_key: string,
    expire_token: string,
}


// Arguments interfaces
export interface IArgID {
    id: number,
}

// List Arguments interfaces
export interface IArgAddList {
    name: string,
    public: boolean,
}

// User Arguments interfaces
export interface IArgLogUser {
    email: string,
    password: string
}

export interface IArgAddUser extends IArgLogUser {
    username: string,
}

//Task Arguments interfaces
export interface IArgAddTask {
    listId: number,
    text: string,
}

export interface IArgDeleteTask extends IArgID {
    inPublicList: boolean,
}

