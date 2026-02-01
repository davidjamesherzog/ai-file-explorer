/**
 * Utility to map file extensions to Material Icons
 */

export function getFileIcon(item: {
  isDirectory: boolean
  extension?: string
}): string {
  if (item.isDirectory) {
    return 'folder'
  }

  const ext = item.extension?.toLowerCase()

  // Document files
  if (['.pdf'].includes(ext || '')) return 'picture_as_pdf'
  if (['.doc', '.docx'].includes(ext || '')) return 'description'
  if (['.xls', '.xlsx', '.csv'].includes(ext || '')) return 'table_chart'
  if (['.ppt', '.pptx'].includes(ext || '')) return 'slideshow'
  if (['.txt', '.md', '.markdown'].includes(ext || '')) return 'article'

  // Image files
  if (
    ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.svg', '.webp', '.ico'].includes(
      ext || ''
    )
  )
    return 'image'

  // Video files
  if (
    ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.mkv', '.webm'].includes(
      ext || ''
    )
  )
    return 'movie'

  // Audio files
  if (
    ['.mp3', '.wav', '.flac', '.aac', '.ogg', '.wma', '.m4a'].includes(
      ext || ''
    )
  )
    return 'audio_file'

  // Archive files
  if (['.zip', '.rar', '.7z', '.tar', '.gz', '.bz2'].includes(ext || ''))
    return 'folder_zip'

  // Code files
  if (['.js', '.ts', '.jsx', '.tsx', '.vue'].includes(ext || ''))
    return 'javascript'
  if (['.html', '.htm', '.xml'].includes(ext || '')) return 'html'
  if (['.css', '.scss', '.sass', '.less'].includes(ext || '')) return 'css'
  if (['.json', '.yaml', '.yml', '.toml'].includes(ext || ''))
    return 'data_object'
  if (['.py'].includes(ext || '')) return 'code'
  if (['.java', '.class', '.jar'].includes(ext || '')) return 'code'
  if (['.c', '.cpp', '.h', '.hpp'].includes(ext || '')) return 'code'
  if (['.sh', '.bash', '.zsh'].includes(ext || '')) return 'terminal'

  // Executable files
  if (['.exe', '.app', '.dmg', '.deb', '.rpm'].includes(ext || ''))
    return 'settings_applications'

  // Default file icon
  return 'insert_drive_file'
}

export function getFileIconColor(item: {
  isDirectory: boolean
  extension?: string
}): string {
  if (item.isDirectory) {
    return 'primary'
  }

  const ext = item.extension?.toLowerCase()

  // Color coding for different file types
  if (['.pdf'].includes(ext || '')) return 'red'
  if (['.doc', '.docx'].includes(ext || '')) return 'blue'
  if (['.xls', '.xlsx', '.csv'].includes(ext || '')) return 'green'
  if (['.ppt', '.pptx'].includes(ext || '')) return 'orange'

  if (
    ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.svg', '.webp', '.ico'].includes(
      ext || ''
    )
  )
    return 'purple'

  if (
    ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.mkv', '.webm'].includes(
      ext || ''
    )
  )
    return 'pink'

  if (
    ['.mp3', '.wav', '.flac', '.aac', '.ogg', '.wma', '.m4a'].includes(
      ext || ''
    )
  )
    return 'teal'

  if (['.zip', '.rar', '.7z', '.tar', '.gz', '.bz2'].includes(ext || ''))
    return 'amber'

  if (
    [
      '.js',
      '.ts',
      '.jsx',
      '.tsx',
      '.vue',
      '.html',
      '.css',
      '.json',
      '.py',
      '.java',
      '.c',
      '.cpp',
    ].includes(ext || '')
  )
    return 'indigo'

  return 'grey'
}
