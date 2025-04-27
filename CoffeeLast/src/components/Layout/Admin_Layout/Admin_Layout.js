import style from './Admin_Layout.module.css'

function Admin_Layout({children}) {
    return ( 
    <div>
        <div className={style.Container}>
            <div>
                <h1>Header</h1>
            </div>
            <div >
                {children}
            </div>
        </div>

        
    </div> );
}
export default Admin_Layout;