import './PetView.css'
import petImg from '@/assets/pets/apteryx_1.png'

function PetView() {
    // mock values — switch to props or state when integrating
    const level = 2
    const currentExp = 40
    const maxExp = 60
    const percent = Math.max(0, Math.min(100, (currentExp / maxExp) * 100))

    return (
        <div className="pet-container">
            <h1 className="pet-name">Apteryx</h1>
            <img src={petImg} alt="pet" className="pet-img" />

            <div className="pet-exp">
                <div className="exp-row">
                    <div className="exp-label">Exp.</div>
                    <div className="pet-level">Lv.{level}</div>
                </div>

                <div className="exp-bar" aria-hidden>
                    <div className="exp-fill" style={{ width: `${percent}%` }}></div>
                </div>
            </div>
        </div>
    )
}

export default PetView;