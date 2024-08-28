import { Button } from './ui/button'
import { FragmentSchema } from '@/lib/schema'
import { CheckIcon, Cross2Icon, Share1Icon } from '@radix-ui/react-icons'
import { DeepPartial } from 'ai'
import Cookies from 'js-cookie'
import { Loader2 } from 'lucide-react'
import { useState } from 'react'

interface ShareBtnProps {
  artifact?: DeepPartial<FragmentSchema>
  url: string
}

const ShareBtn = ({ artifact, url }: ShareBtnProps) => {
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const accessToken = Cookies.get('access')
  const handleShare = async () => {
    setIsLoading(true)
    setStatus('idle')
    try {
      const res_a = await fetch(
        'https://tkvhuacitlsohuhamveq.supabase.co/functions/v1/fetch-webapp-metadata/',
        {
          method: 'POST',
          body: JSON.stringify({ url: url }),
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRrdmh1YWNpdGxzb2h1aGFtdmVxIiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODY2NzE2MjgsImV4cCI6MjAwMjI0NzYyOH0.ELd8atcQDd9recAzngdzcFEfruxy1aFlId4o4HTrxVg`,
          },
        },
      )
      const data = await res_a.json()

      const payload = {
        code: artifact.code,
        title: data.title,
        summary: data.summary,
        url: url,
        template: artifact.template,
        service: 'inQuestAI',
        website_preview: data.image,
      }

      const response = await fetch('https://api.inquestai.com/artifact/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
      })

      const responseData = await response.json()

      if (responseData?.id) {
        setStatus('success')
        window.open(
          `https://inquestai.com/artifacts?artifactId=${responseData.id}`,
          '_blank',
        )
      }

      if (!responseData?.id) {
        setStatus('error')
        throw new Error('Share failed')
      }
    } catch (error) {
      setStatus('error')
    } finally {
      setIsLoading(false)
      // Reset status after 20 seconds
      setTimeout(() => setStatus('idle'), 3000)
    }
  }

  const getButtonContent = () => {
    if (isLoading) {
      return (
        <>
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
          Sharing...
        </>
      )
    }

    switch (status) {
      case 'success':
        return (
          <>
            <CheckIcon className="h-4 w-4 text-green-500 mr-2" />
            Shared
          </>
        )
      case 'error':
        return (
          <>
            <Cross2Icon className="h-4 w-4 text-red-500 mr-2" />
            Error
          </>
        )
      default:
        return (
          <>
            <Share1Icon className="h-4 w-4 mr-2" />
            Share
          </>
        )
    }
  }

  return (
    <Button
      variant="default"
      className={`h-8 rounded-md px-3 ${
        status === 'success'
          ? 'text-green-500'
          : status === 'error'
            ? 'text-red-500'
            : 'text-white'
      }`}
      title="Share to inquestAI"
      onClick={handleShare}
      disabled={
        isLoading ||
        !artifact.code ||
        !accessToken ||
        artifact.template !== 'nextjs-developer'
      }
    >
      {getButtonContent()}
    </Button>
  )
}

export default ShareBtn
