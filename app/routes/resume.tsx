import React, { useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import Ats from '~/components/Ats'
import Details from '~/components/Details'
import Summary from '~/components/Summary'
import { usePuterStore } from '~/lib/puter'

export const meta =()=>([
    {title:'Resumind | Review'},
    {name:'description', content:'Detailed overview of your resume'}
])
const resume = () => {
    const {auth, isLoading, fs, kv} =usePuterStore()
    const {id} =useParams()

    const [imageUrl, setImageUrl] = React.useState<string | null>('') ;           
    const [resumeUrl, setResumeUrl] = React.useState<string | null>('');
    const [feedback, setFeedback] = React.useState<Feedback | null>(null);
    const navigate =useNavigate()

    useEffect(()=>{
        if(!isLoading && !auth.isAuthenticated) navigate('/auth?next=/resume/' + id)
    }, [isLoading])

    useEffect(()=>{
        const loadResume = async()=>{
            const resume = await kv.get(`resume:${id}`) //this will give us the resume data, fetching it from the backend or from puter

            if(!resume) return

            const data = JSON.parse(resume) //this will give us the resume data, which includes the image path, resume path and feedback

            const resumeBlob =await fs.read(data.resumePath); //this will give us a blob format, we are reading the resume file from the file system
            if(!resumeBlob) return

            //so we want to convert the actual blob to a pdf format that is accessible and readable
            const pdfBlob = new Blob([resumeBlob], {type: 'application/pdf'})
            const resumeUrl = URL.createObjectURL(pdfBlob)
            setResumeUrl(resumeUrl)

            const imageBlob = await fs.read(data.imagePath); // this will give us the image blob, we are reading the image file from the file system
            if(!imageBlob) return
            const imageUrl = URL.createObjectURL(new Blob([imageBlob], {type: 'image/png'}))
            setImageUrl(imageUrl)

            setFeedback(data.feedback)
            console.log('resume data', {resumeUrl, imageUrl, feedback:data.feedback})
        }

        loadResume()
    }, [id])

  return (
    <main className='!pt-0'>
        <nav className='resume-nav'>
            <Link to={'/'} className='back-button'>
                <img src='/icons/back.svg' alt='logo' className='w-2.5 h-2.5'/>
                <span className='text-gray-800 tect-sm font-bold'>Back to Home page</span>
            </Link>
        </nav>

        <div className='flex flex-row max-lg:flex-col-reverse w-full'>
            <section className='feedback-section bg-[url("/images/bg-small.svg")] bg-cover h-[100vh] sticky top-0 items-center justify-center'>
                {imageUrl && resumeUrl && (
                    <div className='animate-in fade-in duration-1000 gradient-border h-[90%] max-wxl:h-fit w-fit'>
                        <a href={resumeUrl} target='_blank' rel='noopener noreferrer' className='w-full h-full flex items-center justify-center'>
                            <img src={imageUrl} alt='resume-image' className='w-full h-full rounded-2xl object-contain' />
                        </a>
                    </div>
                ) }
            </section>

            <section className='feedback-section'>
                <h2 className='text-4xl !text-black font-bold'>Resume Review</h2>
                {feedback ? (
                    <div className='flex flex-col gap-8 animate-in fade-in duration-1000'>
                        <Summary feedback={feedback} />
                        <Ats score ={feedback.ATS.score || 0} suggestions={feedback.ATS.tips || []} />
                        <Details feedback={feedback} />
                    </div>
                ) : (
                    <img src='/images/resume-scan-2.gif' className='w-full' />
                )}
            </section>
        </div>
      Resume {id}
    </main>
  )
}

export default resume
