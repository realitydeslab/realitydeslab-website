'use client'
import { Project } from 'contentlayer/generated'
import { CoreContent } from 'pliny/utils/contentlayer'
import HoverVideoPlayer from 'react-hover-video-player'
import { EVENT_PROJECT_SHOW_DESC } from './ProjectDescription'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Cover from './Cover'
interface Props {
  projects: CoreContent<Project>[]
}

const Projects = ({ projects }: Props) => {
  const router = useRouter()

  const handleMouseEnter = (project: CoreContent<Project>) => {
    const { title, description, year_range } = project
    window.dispatchEvent(
      new CustomEvent(EVENT_PROJECT_SHOW_DESC, { detail: { title, description, year_range } })
    )
  }
  const handleMouseLeave = (project: CoreContent<Project>) => {
    window.dispatchEvent(new CustomEvent(EVENT_PROJECT_SHOW_DESC, { detail: null }))
  }

  const handleClick = (project: CoreContent<Project>) => {
    router.push(project.url)
  }

  return (
    <div className="flex flex-col gap-3">
      {projects.map((project) => {
        return (
          <div className="relative  cursor-pointer lg:w-full lg:max-w-wide" key={project.slug}>
            {project.coverVideo_data.type == 'video' ? (
              <HoverVideoPlayer
                className="block h-full w-full"
                onClick={() => handleClick(project)}
                // onTouchEnd={() => handleClick(project)}
                onHoverStart={() => handleMouseEnter(project)}
                onHoverEnd={() => handleMouseLeave(project)}
                videoSrc={project.coverVideo_data.uri}
                pausedOverlay={
                  <Image
                    fill={true}
                    sizes="(max-width:768px) 100vw,(max-width:1200px) 70vw,66vw"
                    className="h-full w-full object-cover"
                    src={project.cover_data.uri}
                    alt={`preview_${project.title}`}
                  />
                }
                loadingOverlay={
                  <div className="loading-overlay">
                    <div className="loading-spinner" />
                  </div>
                }
              />
            ) : (
              <Link
                title={project.title}
                href={project.url}
                onMouseMoveCapture={() => handleMouseEnter(project)}
                onMouseLeave={() => handleMouseLeave(project)}
              >
                <Cover
                  cover={project.cover_data}
                  alt={project.title}
                  className="h-full w-full object-cover"
                />
                <figcaption className="hidden">
                  {project.title}-{project.cover_data.uri}
                </figcaption>
              </Link>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default Projects
